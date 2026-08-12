import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({error: "missing id"}, {status: 400});

  const [order, cart, cartByToken] = await Promise.all([
    prisma.order.findUnique({where: {id}}),
    prisma.cart.findUnique({where: {id}}),
    prisma.cart.findFirst({where: {cartToken: id}}),
  ]);

  return NextResponse.json({
    id,
    foundIn: {
      order: order ? {id: order.id, status: order.status} : null,
      cartById: cart ? {id: cart.id, status: cart.status} : null,
      cartByToken: cartByToken
        ? {id: cartByToken.id, status: cartByToken.status}
        : null,
    },
  });
}
