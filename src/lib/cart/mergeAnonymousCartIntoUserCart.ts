"use server";

import {cookies} from "next/headers";
import {ensureSession} from "@/acl/acl";
import prisma from "@/lib/prisma";

const CART_COOKIE = "cartId";

type MergeWarning = {
  optionId: string;
  requested: number;
  available: number;
  reason: "not_found" | "stock_limit";
};

type MergeResult = {
  merged: boolean;
  mergedCount: number;
  warnings: MergeWarning[];
};

export async function mergeAnonymousCartIntoUserCart(): Promise<MergeResult | null> {
  const session = await ensureSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cookieStore = await cookies();
  const guestCartId = cookieStore.get(CART_COOKIE)?.value;

  if (!guestCartId) {
    return null;
  }

  const result = await prisma.$transaction(async (tx) => {
    const guestCart = await tx.cart.findUnique({
      where: {
        id: guestCartId,
      },
      select: {
        id: true,
        items: {
          select: {
            id: true,
            optionId: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return {
        merged: false,
        mergedCount: 0,
        warnings: [],
      };
    }

    let userCart = await tx.cart.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    if (!userCart) {
      userCart = await tx.cart.create({
        data: {
          userId,
          status: "ACTIVE",
        },
        select: {
          id: true,
        },
      });
    }

    const optionIds = [
      ...new Set(guestCart.items.map((item) => item.optionId)),
    ];

    const options = await tx.option.findMany({
      where: {
        id: {
          in: optionIds,
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    const optionsById = new Map(options.map((option) => [option.id, option]));

    const existingUserItems = await tx.cartItem.findMany({
      where: {
        cartId: userCart.id,
        optionId: {
          in: optionIds,
        },
      },
      select: {
        id: true,
        optionId: true,
        quantity: true,
      },
    });

    const userItemsByOptionId = new Map(
      existingUserItems.map((item) => [item.optionId, item]),
    );

    const warnings: MergeWarning[] = [];
    const guestItemIdsToDelete: string[] = [];
    let mergedCount = 0;

    for (const guestItem of guestCart.items) {
      const option = optionsById.get(guestItem.optionId);

      if (!option) {
        warnings.push({
          optionId: guestItem.optionId,
          requested: guestItem.quantity,
          available: 0,
          reason: "not_found",
        });

        continue;
      }

      const existingUserItem = userItemsByOptionId.get(guestItem.optionId);

      const existingQuantity = existingUserItem?.quantity ?? 0;

      const availableToAdd = Math.max(0, option.quantity - existingQuantity);

      const quantityToAdd = Math.min(guestItem.quantity, availableToAdd);

      if (quantityToAdd <= 0) {
        warnings.push({
          optionId: guestItem.optionId,
          requested: guestItem.quantity,
          available: 0,
          reason: "stock_limit",
        });

        continue;
      }

      const mergedQuantity = existingQuantity + quantityToAdd;

      if (existingUserItem) {
        await tx.cartItem.update({
          where: {
            id: existingUserItem.id,
          },
          data: {
            quantity: mergedQuantity,
          },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: userCart.id,
            optionId: guestItem.optionId,
            quantity: quantityToAdd,
            unitPrice: guestItem.unitPrice,
          },
        });
      }

      mergedCount += quantityToAdd;

      if (quantityToAdd === guestItem.quantity) {
        guestItemIdsToDelete.push(guestItem.id);
      } else {
        await tx.cartItem.update({
          where: {
            id: guestItem.id,
          },
          data: {
            quantity: guestItem.quantity - quantityToAdd,
          },
        });
      }

      userItemsByOptionId.set(guestItem.optionId, {
        id: existingUserItem?.id ?? "created",
        optionId: guestItem.optionId,
        quantity: mergedQuantity,
      });
    }

    if (guestItemIdsToDelete.length > 0) {
      await tx.cartItem.deleteMany({
        where: {
          id: {
            in: guestItemIdsToDelete,
          },
          cartId: guestCart.id,
        },
      });
    }

    const remainingItems = await tx.cartItem.count({
      where: {
        cartId: guestCart.id,
      },
    });

    if (remainingItems === 0) {
      await tx.cart.delete({
        where: {
          id: guestCart.id,
        },
      });
    }

    return {
      merged: mergedCount > 0,
      mergedCount,
      warnings,
      guestCartEmpty: remainingItems === 0,
    };
  });

  if (result && "guestCartEmpty" in result && result.guestCartEmpty) {
    cookieStore.delete(CART_COOKIE);
  }

  return {
    merged: result.merged,
    mergedCount: result.mergedCount,
    warnings: result.warnings,
  };
}
