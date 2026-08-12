import {cookies, headers} from "next/headers";
import prisma from "@/lib/prisma";
import {auth} from "@/lib/auth";
import {mergeGuestCartIntoUserCart} from "@/lib/cart/mergeGuestCart";
import type {
  Cart,
  CartItem,
  Option,
  Product,
  Variant,
} from "@/generated/prisma/browser";

type CartWithItems = Cart & {
  items: (CartItem & {
    option:
      | (Option & {
          variant?: (Variant & {product?: Product | null}) | null;
        })
      | null;
  })[];
};

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

async function setCartCookie(cartId: string) {
  const cookieStore = await cookies();
  cookieStore.set("cartId", cartId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

async function resolveUserId(inputUserId?: string) {
  if (inputUserId) return inputUserId;

  try {
    const hdrs = await headers();
    const headerObj = Object.fromEntries(hdrs.entries()) as Record<
      string,
      string
    >;
    const session = await auth.api.getSession({headers: headerObj});
    return session?.user?.id ?? null;
  } catch (error) {
    console.log("/getOrCreateCart: session resolution error", String(error));
    return null;
  }
}

export async function getOrCreateCart(
  userId?: string,
  createIfMissing = false,
): Promise<CartWithItems | null> {
  const cookieStore = cookies();
  const cartId = (await cookieStore).get("cartId")?.value ?? null;
  console.info("getOrCreateCart: incoming cookie cartId=", cartId);
  const resolvedUserId = await resolveUserId(userId);
  console.info("getOrCreateCart: resolvedUserId=", resolvedUserId);

  if (resolvedUserId) {
    const existing = await prisma.cart.findFirst({
      where: {
        userId: resolvedUserId,
        status: "ACTIVE",
      },
      include: cartInclude,
    });

    // If there is an active user cart
    if (existing) {
      console.info("getOrCreateCart: found existing user cart", existing.id);
      // If there's a guest cart cookie, merge it into the user cart
      if (cartId && cartId !== existing.id) {
        await mergeGuestCartIntoUserCart(cartId, resolvedUserId);
        const reloaded = await prisma.cart.findUnique({
          where: {id: existing.id},
          include: cartInclude,
        });
        if (reloaded) {
          console.info("getOrCreateCart: reloaded user cart", reloaded.id);
          if (cartId !== reloaded.id) await setCartCookie(reloaded.id);
          return reloaded as CartWithItems;
        }
      }

      if (cartId !== existing.id) await setCartCookie(existing.id);
      return existing as CartWithItems;
    }

    // No user cart exists; if there's a guest cart, adopt it
    if (cartId) {
      const guest = await prisma.cart.findUnique({where: {id: cartId}});
      if (guest && guest.status === "ACTIVE") {
        const adopted = await prisma.cart.update({
          where: {id: guest.id},
          data: {userId: resolvedUserId},
          include: cartInclude,
        });
        if (cartId !== adopted.id) await setCartCookie(adopted.id);
        return adopted as CartWithItems;
      }
    }

    const newCart = await prisma.cart.create({
      data: {
        userId: resolvedUserId,
        status: "ACTIVE",
        cartToken: crypto.randomUUID(),
      },
      include: cartInclude,
    });

    console.info("getOrCreateCart: created new user cart", newCart.id);

    if (cartId !== newCart.id) await setCartCookie(newCart.id);
    return newCart as CartWithItems;
  }

  if (cartId) {
    const existing = await prisma.cart.findUnique({
      where: {id: cartId},
      include: cartInclude,
    });

    if (existing?.status === "ACTIVE") {
      return existing as CartWithItems;
    }
  }

  if (!createIfMissing) return null;

  const newCart = await prisma.cart.create({
    data: {
      cartToken: crypto.randomUUID(),
      status: "ACTIVE",
    },
    include: cartInclude,
  });

  await setCartCookie(newCart.id);
  return newCart as CartWithItems;
}

export default getOrCreateCart;
