(async function () {
  try {
    const fs = require("fs");
    if (!process.env.DATABASE_URL) {
      try {
        const env = fs.readFileSync("./.env", "utf8");
        env.split(/\r?\n/).forEach((line) => {
          const m = line.match(
            /^\s*([A-Z0-9_]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(.*))\s*$/i,
          );
          if (m) {
            const key = m[1];
            const val = m[2] ?? m[3] ?? m[4] ?? "";
            if (!process.env[key]) process.env[key] = val;
          }
        });
      } catch (e) {
        /* ignore */
      }
    }

    const {PrismaClient} = require("../src/generated/prisma");
    const {PrismaPg} = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
    const prisma = new PrismaClient({adapter});

    console.log(
      "Cleanup: removing carts with cartToken starting with guesttest_ or guestmerge_",
    );
    const toCleanup = await prisma.cart.findMany({
      where: {cartToken: {startsWith: "guesttest_"}},
      select: {id: true},
    });
    const toCleanup2 = await prisma.cart.findMany({
      where: {cartToken: {startsWith: "guestmerge_"}},
      select: {id: true},
    });
    const all = [...toCleanup, ...toCleanup2];
    for (const c of all) {
      // delete orders referencing this cart
      await prisma.order.deleteMany({where: {cartId: c.id}});
      // delete cart items
      await prisma.cartItem.deleteMany({where: {cartId: c.id}});
      // delete cart
      await prisma.cart.deleteMany({where: {id: c.id}});
      console.log("deleted cart", c.id);
    }

    // Prepare merge test
    // ensure an option exists
    const option = await prisma.option.findFirst();
    if (!option) {
      console.error("No option found");
      process.exit(1);
    }

    // create user (unique email)
    const email = "merge_test_user@example.com";
    // remove existing test user if present
    await prisma.user.deleteMany({where: {email}});
    const user = await prisma.user.create({
      data: {name: "Merge Test", email, emailVerified: true},
    });
    console.log("Created user", user.id);

    // create an existing user cart with one item of the same option
    const userCart = await prisma.cart.create({
      data: {userId: user.id, status: "ACTIVE"},
    });
    await prisma.cartItem.create({
      data: {
        cartId: userCart.id,
        optionId: option.id,
        quantity: 2,
        unitPrice: option.sellPrice,
      },
    });
    console.log("Created user cart", userCart.id);

    // create guest cart with one item
    const guestCart = await prisma.cart.create({
      data: {cartToken: "guestmerge_" + Date.now(), status: "ACTIVE"},
    });
    await prisma.cartItem.create({
      data: {
        cartId: guestCart.id,
        optionId: option.id,
        quantity: 3,
        unitPrice: option.sellPrice,
      },
    });
    console.log("Created guest cart", guestCart.id);

    // Perform merge (same logic as mergeGuestCartIntoUserCart)
    const result = await prisma.$transaction(async (tx) => {
      const guest = await tx.cart.findUnique({
        where: {id: guestCart.id},
        include: {items: true},
      });
      if (!guest) return null;
      const ucart = await tx.cart.findFirst({
        where: {userId: user.id, status: "ACTIVE"},
        include: {items: true},
      });
      if (!ucart) {
        await tx.cart.update({
          where: {id: guestCart.id},
          data: {userId: user.id, status: "ACTIVE"},
        });
        return tx.cart.findUnique({
          where: {id: guestCart.id},
          include: {items: {include: {option: true}}},
        });
      }
      for (const gi of guest.items) {
        if (!gi.optionId) continue;
        await tx.cartItem.upsert({
          where: {cartId_optionId: {cartId: ucart.id, optionId: gi.optionId}},
          update: {quantity: {increment: gi.quantity}},
          create: {
            cartId: ucart.id,
            optionId: gi.optionId,
            quantity: gi.quantity,
            unitPrice: gi.unitPrice,
          },
        });
      }
      await tx.cart.update({
        where: {id: guestCart.id},
        data: {status: "ABANDONED"},
      });
      return tx.cart.findUnique({
        where: {id: ucart.id},
        include: {items: {include: {option: true}}},
      });
    });

    console.log(
      "Merge result (user cart):",
      result
        ? {
            id: result.id,
            items: result.items.map((i) => ({
              optionId: i.optionId,
              qty: i.quantity,
            })),
          }
        : null,
    );

    // Verify guest cart status
    const guestAfter = await prisma.cart.findUnique({
      where: {id: guestCart.id},
    });
    console.log("Guest cart status after merge:", guestAfter?.status);

    // Cleanup merge test data: delete orders (none expected), delete cartItems, carts, user
    await prisma.cartItem.deleteMany({where: {cartId: guestCart.id}});
    await prisma.cart.deleteMany({where: {id: guestCart.id}});
    await prisma.cartItem.deleteMany({where: {cartId: userCart.id}});
    await prisma.cart.deleteMany({where: {id: userCart.id}});
    await prisma.user.deleteMany({where: {id: user.id}});
    console.log("Cleaned up merge test data");

    await prisma.$disconnect();
  } catch (err) {
    console.error("Script error:", err);
    process.exit(1);
  }
})();
