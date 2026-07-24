"use server";

import prisma from "@/lib/prisma";
import {revalidatePath} from "next/cache";

export async function updateCartItem(itemId: string, quantity: number) {
  if (quantity < 1) throw new Error("Quantity must be >= 1");

  await prisma.cartItem.update({
    where: {id: itemId},
    data: {quantity},
  });

  revalidatePath("/cart");
  revalidatePath("/");
}
