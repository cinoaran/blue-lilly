"use server";

import prisma from "@/lib/prisma";
import {revalidatePath} from "next/cache";

export async function removeCartItem(itemId: string) {
  await prisma.cartItem.delete({where: {id: itemId}});

  revalidatePath("/cart");
  revalidatePath("/");
}
