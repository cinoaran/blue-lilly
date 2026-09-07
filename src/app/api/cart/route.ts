import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {getOrCreateCart} from "@/lib/cart/getOrCreateCart";
import {revalidatePath} from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = body?.productId as string | undefined;
    const quantity = typeof body?.quantity === "number" ? body.quantity : 1;

    if (!productId)
      return NextResponse.json({error: "productId required"}, {status: 400});

    // Find a default option for the product (prefer available stock)
    const option = await prisma.option.findFirst({
      where: {
        variant: {productId},
        // you can prefer options with stock > 0
      },
      orderBy: [{quantity: "desc"}],
      select: {id: true, sellPrice: true, quantity: true},
    });

    if (!option)
      return NextResponse.json(
        {error: "No purchasable option found"},
        {status: 400},
      );

    const cart = await getOrCreateCart(undefined, true);
    if (!cart)
      return NextResponse.json({error: "Failed to obtain cart"}, {status: 500});

    const existing = await prisma.cartItem.findUnique({
      where: {cartId_optionId: {cartId: cart.id, optionId: option.id}},
    });

    const existingQty = existing?.quantity ?? 0;
    const available =
      typeof option.quantity === "number" ? option.quantity : Infinity;
    const canAdd = Math.max(0, available - existingQty);
    if (canAdd <= 0) {
      return NextResponse.json({error: "No availability"}, {status: 400});
    }

    const qtyToAdd = Math.min(quantity, canAdd);

    if (existing) {
      await prisma.cartItem.update({
        where: {id: existing.id},
        data: {quantity: {increment: qtyToAdd}},
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          optionId: option.id,
          quantity: qtyToAdd,
          unitPrice: option.sellPrice,
        },
      });
    }

    try {
      revalidatePath("/cart");
      revalidatePath("/");
    } catch (e) {
      console.error("Failed to revalidate paths", e);
      // ignore
    }

    return NextResponse.json({ok: true}, {status: 201});
  } catch (e) {
    console.error("/api/cart POST error", e);
    return NextResponse.json({error: "Server error"}, {status: 500});
  }
}
