import {cookies} from "next/headers";
import prisma from "@/lib/prisma";

export async function getOrCreateCart(userId?: string) {
  const cookieStore = cookies();
  const cartId = (await cookieStore).get("cartId")?.value;

  if (userId) {
    const existing = await prisma.cart.findFirst({
      where: {userId},
    });

    if (existing) return existing;

    return prisma.cart.create({
      data: {userId},
    });
  }

  if (cartId) {
    const existing = await prisma.cart.findUnique({
      where: {id: cartId},
    });

    if (existing) return existing;
  }

  const cart = await prisma.cart.create({
    data: {},
  });

  (await cookieStore).set("cartId", cart.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return cart;
}
