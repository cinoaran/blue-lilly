import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {auth} from "@/lib/auth";
import {getSessionOnce} from "@/lib/session/sessionCache";
import {createStripeCheckout} from "@/lib/Stripe/orders";
import {toStripeAmount} from "@/lib/Stripe/client";
import {getOrCreateCart} from "@/lib/cart/getOrCreateCart";
import type {Prisma} from "@/generated/prisma/browser";
import * as z from "zod";

const addressSchema = z.object({
  firstName: z.string().min(1, "Vorname erforderlich"),
  lastName: z.string().min(1, "Nachname erforderlich"),
  company: z.string().optional().nullable(),
  addressLine1: z.string().min(1, "Straße erforderlich"),
  addressLine2: z.string().optional().nullable(),
  postalCode: z.string().min(2, "PLZ erforderlich"),
  city: z.string().min(1, "Stadt erforderlich"),
  country: z.string().min(2, "Land erforderlich"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Ungültige E-Mail").optional().nullable(),
});

const clientPreviewSchema = z.object({
  itemsTotalCents: z.number().int().nonnegative(),
  shippingCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
});

const bodySchema = z.object({
  billingId: z.string().optional(),
  shippingId: z.string().optional(),
  billing: addressSchema.optional(),
  shipping: addressSchema.optional(),
  sameAsBilling: z.boolean().optional(),
  clientPreview: clientPreviewSchema.optional(),
});

export async function POST(req: Request) {
  try {
    // Use request headers (API route) instead of next/headers helpers so cookies
    // and auth headers are available in this context.
    const headerObj = Object.fromEntries(req.headers.entries());
    const session = await getSessionOnce({headers: headerObj});
    const userId = session?.user?.id ?? null;

    // Parse cookies from the raw Cookie header on the request
    const cookieHeader = req.headers.get("cookie") ?? "";
    let cartIdCookie: string | null = null;
    if (cookieHeader) {
      const parsed = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [k, ...rest] = c.split("=");
          const key = k?.trim();
          const val = rest.join("=").trim();
          return [key, decodeURIComponent(val)];
        }),
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore parsed is Record<string,string>
      cartIdCookie = parsed["cartId"] ?? null;
    }

    // Helper to safely convert arbitrary JS value into Prisma.InputJsonValue
    const toPrismaJson = (v: unknown): Prisma.InputJsonValue =>
      JSON.parse(JSON.stringify(v));

    const body = await req.json();
    console.info("/api/checkout/create-session payload:", body);

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const serverErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path.join(".") || "_";
        if (!serverErrors[key]) serverErrors[key] = issue.message;
      });
      return NextResponse.json(
        {error: "validation", serverErrors},
        {status: 400},
      );
    }

    const {
      billingId,
      shippingId,
      billing,
      shipping,
      sameAsBilling,
      clientPreview,
    } = parsed.data as z.infer<typeof bodySchema>;

    // 1. Cart laden (User oder Gast)
    let cart = null;

    if (userId) {
      cart = await getOrCreateCart(userId, false);
    } else if (cartIdCookie) {
      cart = await prisma.cart.findUnique({
        where: {id: cartIdCookie},
        include: {
          items: {
            include: {
              option: {
                include: {
                  variant: {
                    include: {product: true},
                  },
                },
              },
            },
          },
        },
      });
      if (cart?.status !== "ACTIVE") cart = null;
    }

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({error: "Cart is empty"}, {status: 400});
    }

    // 2. Adressen verarbeiten
    let finalBillingId: string | null = billingId ?? null;
    let finalShippingId: string | null = shippingId ?? null;
    let shippingSnapshot: Prisma.InputJsonValue | null = null;
    let billingSnapshot: Prisma.InputJsonValue | null = null;

    if (userId) {
      if (!finalBillingId && billing) {
        const created = await prisma.address.create({
          data: {...billing, userId},
        });
        finalBillingId = created.id;
      }

      if (sameAsBilling) {
        finalShippingId = finalBillingId;
      }

      if (!finalShippingId && shipping) {
        const created = await prisma.address.create({
          data: {...shipping, userId},
        });
        finalShippingId = created.id;
      }

      if (!finalBillingId || !finalShippingId) {
        return NextResponse.json({error: "Missing address ids"}, {status: 400});
      }

      const address = await prisma.address.findFirst({
        where: {id: finalBillingId, userId},
      });

      if (!address) {
        return NextResponse.json({error: "Address not found"}, {status: 404});
      }

      shippingSnapshot = {
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        postalCode: address.postalCode,
        city: address.city,
        country: address.country,
        phone: address.phone,
        email: address.email,
      } satisfies Prisma.InputJsonValue;

      billingSnapshot = shippingSnapshot;
    } else {
      if (!shipping) {
        return NextResponse.json(
          {error: "Missing shipping address"},
          {status: 400},
        );
      }

      if (sameAsBilling && billing) {
        shippingSnapshot = billing satisfies Prisma.InputJsonValue;
        billingSnapshot = billing satisfies Prisma.InputJsonValue;
      } else {
        shippingSnapshot = shipping satisfies Prisma.InputJsonValue;
        billingSnapshot = (billing ?? shipping) satisfies Prisma.InputJsonValue;
      }
    }

    // 3. Server-Preview berechnen
    const itemsTotalCents = cart.items.reduce((sum, item) => {
      const unitCents = toStripeAmount(
        Number(item.option?.sellPrice ?? item.unitPrice ?? 0),
      );
      return sum + unitCents * item.quantity;
    }, 0);

    console.info("computed totals (cents)", {itemsTotalCents});

    const DEFAULT_FLAT = 490;
    const DEFAULT_FREE_THRESHOLD = 5000;
    const flatCents = Number(process.env.SHIPPING_FLAT_CENTS ?? DEFAULT_FLAT);
    const freeThreshold = Number(
      process.env.FREE_SHIPPING_THRESHOLD_CENTS ?? DEFAULT_FREE_THRESHOLD,
    );
    const shippingCents = itemsTotalCents >= freeThreshold ? 0 : flatCents;
    const totalCents = itemsTotalCents + shippingCents;

    if (clientPreview) {
      if (
        clientPreview.itemsTotalCents !== itemsTotalCents ||
        clientPreview.shippingCents !== shippingCents ||
        clientPreview.totalCents !== totalCents
      ) {
        console.warn("Totals mismatch", {
          clientPreview,
          serverPreview: {itemsTotalCents, shippingCents, totalCents},
        });
        return NextResponse.json(
          {
            error: "Totals mismatch",
            serverPreview: {itemsTotalCents, shippingCents, totalCents},
          },
          {status: 400},
        );
      }
    }

    // 4. Order anlegen (mit userId oder null)
    const order = await prisma.order.create({
      data: {
        userId,
        // set scalar foreign key directly using UncheckedCreateInput
        cartId: cart.id,
        status: "PENDING",
        itemsTotal: itemsTotalCents,
        shippingCost: shippingCents,
        totalAmount: totalCents,
        currency: "EUR",
        shippingAddressId: finalShippingId,
        billingAddressId: finalBillingId,
        // Prisma types expect `undefined` for absent JSON fields rather than `null`.
        shippingSnapshot: shippingSnapshot
          ? toPrismaJson(shippingSnapshot)
          : undefined,
        billingSnapshot: billingSnapshot
          ? toPrismaJson(billingSnapshot)
          : undefined,
        items: {
          create: cart.items.map((item) => ({
            optionId: item.option?.id ?? null,
            quantity: item.quantity,
            priceAtOrder: toStripeAmount(
              Number(item.option?.sellPrice ?? item.unitPrice ?? 0),
            ),
            nameAtOrder: item.option?.variant?.product?.name ?? "Produkt",
            skuAtOrder: item.option?.sku ?? null,
            productIdAtOrder: item.option?.variant?.product?.id ?? null,
            optionLabelAtOrder: item.option?.variant?.size ?? null,
            imageAtOrder:
              item.option?.image?.[0] &&
              /^https?:\/\//.test(item.option.image[0])
                ? item.option.image[0]
                : null,
          })),
        },
      } as Prisma.OrderUncheckedCreateInput,
      include: {items: true},
    });

    console.info("creating stripe checkout", {
      orderId: order.id,
      userId,
      finalBillingId,
      finalShippingId,
    });

    const url = await createStripeCheckout({
      orderId: order.id,
      userId: userId ?? undefined,
      shippingAddressId: finalShippingId ?? undefined,
      billingAddressId: finalBillingId ?? undefined,
      guestEmail: !userId
        ? (shipping?.email ?? billing?.email ?? undefined)
        : undefined,
    });

    console.info("stripe checkout created, redirect url", url);

    await prisma.cart.updateMany({
      where: {id: cart.id, status: "ACTIVE"},
      data: {status: "ORDERED"},
    });

    return NextResponse.json({url});
  } catch (err) {
    console.error("create-session error:", err);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}
