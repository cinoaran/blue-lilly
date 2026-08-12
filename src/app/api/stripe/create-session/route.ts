import {NextResponse} from "next/server";
import {cookies, headers} from "next/headers";
import prisma from "@/lib/prisma";
import {Prisma} from "@/generated/prisma/client";
import type {
  Cart,
  Order,
  CartItem,
  Option,
  Variant,
  Product,
} from "@/generated/prisma/browser";

type CartWithItems = Cart & {
  items: (CartItem & {
    option?:
      | (Option & {
          variant?: (Variant & {product?: Product | null}) | null;
        })
      | null;
  })[];
};
import {auth} from "@/lib/auth/auth";
import {stripe, toStripeAmount, formatMetadata} from "@/lib/Stripe/client";

const cartInclude = {
  items: {
    include: {
      option: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  },
} as const;

function resolveImageUrl(maybeImage: string | null | undefined) {
  if (!maybeImage) return null;

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const uploadBase =
    process.env.UPLOADTHING_BASE_URL ?? "https://r9q9iiavth.ufs.sh/f";

  if (/^https?:\/\//.test(maybeImage)) return maybeImage;
  if (maybeImage.startsWith("/")) return `${appUrl}${maybeImage}`;
  return `${uploadBase}/${maybeImage}`;
}

export async function POST(req: Request) {
  let userId: string | null = null;
  let cart: CartWithItems | null = null;
  let order: Order | null = null;

  try {
    const hdrs = await headers();
    const headerObj = Object.fromEntries(hdrs.entries()) as Record<
      string,
      string
    >;
    const session = await auth.api.getSession({headers: headerObj});
    userId = session?.user?.id ?? null;

    const cookieStore = await cookies();
    const cartIdCookie = cookieStore.get("cartId")?.value ?? null;

    const body = await req.json();
    const {addressId, guestAddress} = body as {
      addressId?: string;
      guestAddress?: {
        firstName: string;
        lastName: string;
        company?: string;
        addressLine1: string;
        addressLine2?: string;
        postalCode: string;
        city: string;
        country: string;
        phone?: string;
        email?: string;
      };
    };

    cart = null;

    if (userId) {
      cart = await prisma.cart.findFirst({
        where: {
          userId,
          status: "ACTIVE",
        },
        include: cartInclude,
      });
    } else if (cartIdCookie) {
      cart = await prisma.cart.findUnique({
        where: {id: cartIdCookie},
        include: cartInclude,
      });
      if (cart?.status !== "ACTIVE") cart = null;
    }

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({error: "Cart is empty"}, {status: 400});
    }

    let shippingAddressSnapshot: Record<string, unknown> | null = null;
    let billingAddressSnapshot: Record<string, unknown> | null = null;
    let shippingAddressId: string | null = null;
    let billingAddressId: string | null = null;

    if (userId) {
      if (!addressId) {
        return NextResponse.json({error: "Missing addressId"}, {status: 400});
      }

      const address = await prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

      if (!address) {
        return NextResponse.json({error: "Address not found"}, {status: 404});
      }

      shippingAddressId = address.id;
      billingAddressId = address.id;

      shippingAddressSnapshot = {
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
      };

      billingAddressSnapshot = shippingAddressSnapshot;
    } else {
      if (!guestAddress) {
        return NextResponse.json(
          {error: "Missing guestAddress"},
          {status: 400},
        );
      }

      shippingAddressSnapshot = guestAddress;
      billingAddressSnapshot = guestAddress;
    }

    type ItemsForOrderItem = {
      optionId: string | null;
      quantity: number;
      priceAtOrder: number;
      nameAtOrder: string;
      skuAtOrder: string | null;
      productIdAtOrder: string | null;
      optionLabelAtOrder: string | null;
      imageAtOrder: string | null;
    };

    const itemsForOrder = cart.items.map(
      (item: CartWithItems["items"][number]): ItemsForOrderItem => {
        const unitCents = toStripeAmount(Number(item.option?.sellPrice ?? 0));
        const imageAtOrder = resolveImageUrl(item.option?.image?.[0]);

        return {
          optionId: item.option?.id ?? null,
          quantity: item.quantity,
          priceAtOrder: unitCents,
          nameAtOrder: item.option?.variant?.product?.name ?? "Produkt",
          skuAtOrder: item.option?.sku ?? null,
          productIdAtOrder: item.option?.variant?.product?.id ?? null,
          optionLabelAtOrder: item.option?.variant?.size ?? null,
          imageAtOrder,
        };
      },
    );

    const itemsTotal = itemsForOrder.reduce(
      (acc: number, it: ItemsForOrderItem) =>
        acc + it.priceAtOrder * it.quantity,
      0,
    );

    const flatCents = Number(process.env.SHIPPING_FLAT_CENTS ?? 500);
    const freeThreshold = Number(
      process.env.FREE_SHIPPING_THRESHOLD_CENTS ?? 5000,
    );

    const shippingCost = itemsTotal >= freeThreshold ? 0 : flatCents;
    const totalAmount = itemsTotal + shippingCost;

    console.info("stripe.create-session: creating order", {
      userId,
      cartId: cart?.id,
      itemsTotal,
      totalAmount,
    });

    order = await prisma.order.create({
      data: {
        userId,
        status: "PENDING",
        itemsTotal,
        shippingCost,
        totalAmount,
        currency: "EUR",
        shippingAddressId,
        billingAddressId,
        shippingSnapshot: shippingAddressSnapshot as Prisma.InputJsonValue,
        billingSnapshot: billingAddressSnapshot as Prisma.InputJsonValue,
        items: {
          create: itemsForOrder,
        },
      },
      include: {items: true},
    });

    const lineItems = itemsForOrder.map((it: ItemsForOrderItem) => {
      const cartItem = cart!.items.find(
        (ci: CartWithItems["items"][number]) => ci.option?.id === it.optionId,
      );
      const maybeImage =
        it.imageAtOrder ?? cartItem?.option?.image?.[0] ?? null;
      const imageUrl = resolveImageUrl(maybeImage) ?? undefined;

      const product_data: {name: string; images?: string[]} = {
        name: it.nameAtOrder,
      };
      if (imageUrl) product_data.images = [imageUrl];

      return {
        quantity: it.quantity,
        price_data: {
          currency: "eur",
          product_data,
          unit_amount: it.priceAtOrder,
        },
      };
    });

    console.info("stripe.create-session: creating stripe checkout session", {
      orderId: order.id,
      userId,
      cartId: cart.id,
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      metadata: formatMetadata({
        orderId: order.id,
        cartId: cart.id,
        userId: userId ?? "",
        addressId: addressId ?? "",
        guestEmail: !userId ? (guestAddress?.email ?? "") : "",
      }),
      customer_email: !userId ? guestAddress?.email : undefined,
    });

    console.info("stripe.create-session: stripe session created", {
      sessionId: checkoutSession.id,
      orderId: order.id,
    });

    await prisma.$transaction([
      prisma.order.update({
        where: {id: order.id},
        data: {stripeSessionId: checkoutSession.id},
      }),
      prisma.cart.updateMany({
        where: {id: cart.id, status: "ACTIVE"},
        data: {status: "ORDERED"},
      }),
    ]);

    return NextResponse.json({url: checkoutSession.url});
  } catch (error) {
    console.error("Stripe checkout error:", {
      error: String(error),
      orderId: typeof order !== "undefined" && order ? order.id : null,
      cartId: typeof cart !== "undefined" && cart ? cart.id : null,
      userId: typeof userId !== "undefined" ? userId : null,
    });
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}
