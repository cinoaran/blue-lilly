"use server";

import {revalidatePath} from "next/cache";
import prisma from "@/lib/prisma";
import {getOrCreateCart} from "@/lib/cart/getOrCreateCart";

export async function addToCart(
  optionId: string,
  quantity: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<void> {
  const cart = await getOrCreateCart(undefined, true);
  console.info("addToCart: using cart id=", cart?.id ?? null);
  if (!cart) throw new Error("Failed to create or obtain cart");

  // Fetch option including available stock
  const option = await prisma.option.findUnique({
    where: {id: optionId},
    select: {sellPrice: true, quantity: true},
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

  revalidatePath("/cart");
  revalidatePath("/");
}
