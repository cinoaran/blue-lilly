"use server";

import {revalidatePath} from "next/cache";
import prisma from "@/lib/prisma";
import {getOrCreateCart} from "@/lib/cart/getOrCreateCart";
import {headers} from "next/headers";
import {getSessionOnce} from "@/lib/session/sessionCache";

export async function addToCart(
  optionId: string,
  quantity: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<void> {
  const cart = await getOrCreateCart(undefined, true);
  console.info("addToCart: using cart id=", cart?.id ?? null);
  if (!cart) throw new Error("Failed to create or obtain cart");

  // Fetch option including available stock and product id
  const option = await prisma.option.findUnique({
    where: {id: optionId},
    select: {
      sellPrice: true,
      quantity: true,
      variant: {select: {product: {select: {id: true}}}},
    },
  });

  if (!option) return;

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_optionId: {
        cartId: cart.id,
        optionId,
      },
    },
  });

  // Enforce available stock: determine how many can be added
  const existingQty = existing?.quantity ?? 0;
  const available =
    typeof option.quantity === "number" ? option.quantity : Infinity;
  const canAdd = Math.max(0, available - existingQty);

  if (canAdd <= 0) {
    // nothing to add
    return;
  }

  const qtyToAdd = Math.min(quantity, canAdd);

  if (existing) {
    await prisma.cartItem.update({
      where: {id: existing.id},
      data: {
        quantity: {increment: qtyToAdd},
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        optionId,
        quantity: qtyToAdd,
        unitPrice: option.sellPrice,
      },
    });
  }

  // If the user has a wishlist, remove the product from it after adding to cart
  try {
    const hdrs = await headers();
    const headerObj = Object.fromEntries(hdrs.entries()) as Record<string, string>;
    const session = await getSessionOnce({headers: headerObj});
    const productId = option?.variant?.product?.id ?? null;
    if (session?.user?.id && productId) {
      const wishlist = await prisma.wishlist.findUnique({where: {userId: session.user.id}});
      if (wishlist) {
        await prisma.wishlistItem.deleteMany({where: {wishlistId: wishlist.id, productId}});
        revalidatePath("/wishlist");
      }
    }
  } catch (e) {
    console.error("addToCart: cleanup wishlist error", e);
  }

  revalidatePath("/cart");
  revalidatePath("/");
}
