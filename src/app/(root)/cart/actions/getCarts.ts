import {cookies, headers} from "next/headers";
import prisma from "@/lib/prisma";
import {auth} from "@/lib/auth/auth";
import {getSessionOnce} from "@/lib/session/sessionCache";
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
    orderBy: {createdAt: "asc"},
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

export async function getCart(): Promise<CartWithItems | null> {
  const hdrs = await headers();
  const headerObj = Object.fromEntries(hdrs.entries()) as Record<
    string,
    string
  >;
  const session = await getSessionOnce({headers: headerObj});

  const userId = session?.user?.id ?? null;

  const cookieStore = cookies();
  const cartId = (await cookieStore).get("cartId")?.value ?? null;

  if (userId) {
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: cartInclude,
    });

    return cart as CartWithItems | null;
  }

  if (cartId) {
    const cart = await prisma.cart.findUnique({
      where: {id: cartId},
      include: cartInclude,
    });

    if (cart?.status === "ACTIVE") {
      return cart as CartWithItems;
    }
  }

  return null;
}
