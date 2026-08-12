"use server";

import prisma from "@/lib/prisma";
import {cookies} from "next/headers";

const CART_COOKIE = "cartId";

type MergeResult = {
  merged: boolean;
  mergedCount: number;
  warnings: Array<{optionId: string; requested: number; available: number}>;
};

export async function mergeAnonymousCartIntoUserCart(
  userId: string,
): Promise<MergeResult | null> {
  const cookieStore = cookies();
  const cookie = await cookieStore;
  const cartId = cookie.get(CART_COOKIE)?.value;
  console.log(`/api/mergeAnonymousCart: incoming cartId cookie=${cartId}`);
  if (!cartId) return null;

  const result = await prisma.$transaction(async (tx) => {
    const guestCart = await tx.cart.findUnique({
      where: {id: cartId},
      include: {items: true},
    });

    console.log(
      `/api/mergeAnonymousCart: guestCart found=${guestCart ? "yes" : "no"} id=${guestCart?.id ?? "-"} items=${guestCart?.items?.length ?? 0}`,
    );

    if (!guestCart) return null;

    // Resolve or create a user cart. `userId` is not a unique field in
    // the schema anymore, so `upsert` with `where: { userId }` is invalid.
    // Use findFirst then create to obtain a cart within the transaction.
    let userCart = await tx.cart.findFirst({
      where: {userId},
      include: {items: true},
    });
    if (!userCart) {
      userCart = await tx.cart.create({
        data: {userId, status: "ACTIVE"},
        include: {items: true},
      });
    }

    let mergedCount = 0;
    const warnings: MergeResult["warnings"] = [];

    for (const guestItem of guestCart.items) {
      // read option stock
      const option = await tx.option.findUnique({
        where: {id: guestItem.optionId},
        select: {quantity: true},
      });

      const available = option?.quantity ?? 0; // available in stock

      const existingItem = userCart.items.find(
        (it) => it.optionId === guestItem.optionId,
      );
      const existingQty = existingItem?.quantity ?? 0;

      const requestedTotal = existingQty + guestItem.quantity;

      if (requestedTotal <= available) {
        // we can fully merge
        if (existingItem) {
          await tx.cartItem.update({
            where: {id: existingItem.id},
            data: {quantity: requestedTotal},
          });
          mergedCount += guestItem.quantity;
        } else {
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              optionId: guestItem.optionId,
              quantity: guestItem.quantity,
              unitPrice: guestItem.unitPrice,
            },
          });
          mergedCount += guestItem.quantity;
        }
      } else {
        // not enough stock to fully satisfy requested quantity
        const canAdd = Math.max(0, available - existingQty);
        if (canAdd > 0) {
          if (existingItem) {
            await tx.cartItem.update({
              where: {id: existingItem.id},
              data: {quantity: existingQty + canAdd},
            });
          } else {
            await tx.cartItem.create({
              data: {
                cartId: userCart.id,
                optionId: guestItem.optionId,
                quantity: canAdd,
                unitPrice: guestItem.unitPrice,
              },
            });
          }
          mergedCount += canAdd;
        }

        warnings.push({
          optionId: guestItem.optionId,
          requested: guestItem.quantity,
          available: Math.max(0, available - existingQty),
        });
      }
    }

    // delete guest cart (cascade will remove items)
    await tx.cart.delete({where: {id: guestCart.id}});

    return {merged: true, mergedCount, warnings} as MergeResult;
  });

  // remove cookie only after successful transaction
  try {
    (await cookieStore).delete(CART_COOKIE);
    console.log(`/api/mergeAnonymousCart: deleted cookie ${CART_COOKIE}`);
  } catch (e) {
    console.warn("/api/mergeAnonymousCart: failed to delete cookie", e);
  }

  console.log(`/api/mergeAnonymousCart: result=${JSON.stringify(result)}`);

  return result;
}
