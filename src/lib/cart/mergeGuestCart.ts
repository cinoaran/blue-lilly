import prisma from "@/lib/prisma";

const cartInclude = {
  items: {
    include: {
      option: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  },
} as const;

export async function mergeGuestCartIntoUserCart(
  guestCartId: string,
  userId: string,
) {
  console.info("mergeGuestCartIntoUserCart: start", {guestCartId, userId});
  try {
    const result = await prisma.$transaction(async (tx) => {
      const guestCart = await tx.cart.findUnique({
        where: {id: guestCartId},
        include: {items: true},
      });
      if (!guestCart) return null;

      const userCart = await tx.cart.findFirst({
        where: {userId, status: "ACTIVE"},
        include: {items: true},
      });

      // If no user cart exists, adopt the guest cart
      if (!userCart) {
        await tx.cart.update({
          where: {id: guestCartId},
          data: {userId, status: "ACTIVE"},
        });
        return tx.cart.findUnique({
          where: {id: guestCartId},
          include: cartInclude,
        });
      }

      // Merge items using upsert to avoid unique constraint races
      for (const guestItem of guestCart.items) {
        if (!guestItem.optionId) continue;

        await tx.cartItem.upsert({
          where: {
            cartId_optionId: {
              cartId: userCart.id,
              optionId: guestItem.optionId,
            },
          },
          update: {quantity: {increment: guestItem.quantity}},
          create: {
            cartId: userCart.id,
            optionId: guestItem.optionId,
            quantity: guestItem.quantity,
            unitPrice: guestItem.unitPrice,
          },
        });
      }

      // Mark guest cart as abandoned to keep audit trail
      await tx.cart.update({
        where: {id: guestCartId},
        data: {status: "ABANDONED"},
      });

      return tx.cart.findUnique({
        where: {id: userCart.id},
        include: cartInclude,
      });
    });

    console.info("mergeGuestCartIntoUserCart: success", {
      guestCartId,
      userId,
      userCartId: result?.id ?? null,
    });
    return result;
  } catch (error) {
    console.error("mergeGuestCartIntoUserCart: error", {
      guestCartId,
      userId,
      error: String(error),
    });
    throw error;
  }
}

export default mergeGuestCartIntoUserCart;
