// ...existing code...
import {
  Cart,
  CartItem,
  Option,
  Product,
  Variant,
} from "@/generated/prisma/browser";
import prisma from "@/lib/prisma";
import {cookies} from "next/headers";

type CartWithItems = Cart & {
  items: (CartItem & {
    option:
      | (Option & {
          variant?: (Variant & {product?: Product | null}) | null;
        })
      | null;
  })[];
};

export async function getCart(): Promise<CartWithItems | null> {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId) return null;

  const cart = await prisma.cart.findUnique({
    where: {id: cartId},
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

  return cart as CartWithItems | null;
}
// ...existing code...
