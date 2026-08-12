(async function () {
  try {
    // load .env file if DATABASE_URL not present
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

    // find an option
    const option = await prisma.option.findFirst();
    if (!option) {
      console.error("No Option found in DB. Aborting.");
      process.exit(1);
    }

    console.log(
      "Using option id",
      option.id,
      "sellPrice",
      option.sellPrice?.toString(),
    );

    // create guest cart
    const cart = await prisma.cart.create({
      data: {cartToken: "guesttest_" + Date.now(), status: "ACTIVE"},
    });
    console.log("Created cart", cart.id);

    // create cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        optionId: option.id,
        quantity: 1,
        unitPrice: option.sellPrice,
      },
    });
    console.log("Created cartItem", cartItem.id);

    // prepare payload
    const itemsTotalCents = Math.round(Number(option.sellPrice) * 100);
    const DEFAULT_FLAT = 490;
    const DEFAULT_FREE_THRESHOLD = 5000;
    const flatCents = Number(process.env.SHIPPING_FLAT_CENTS ?? DEFAULT_FLAT);
    const freeThreshold = Number(
      process.env.FREE_SHIPPING_THRESHOLD_CENTS ?? DEFAULT_FREE_THRESHOLD,
    );
    const shippingCents = itemsTotalCents >= freeThreshold ? 0 : flatCents;
    const totalCents = itemsTotalCents + shippingCents;

    const payload = {
      shipping: {
        firstName: "Gast",
        lastName: "Tester",
        addressLine1: "Musterstr 1",
        postalCode: "12345",
        city: "Berlin",
        country: "DE",
        email: "guest@example.com",
      },
      billing: {
        firstName: "Gast",
        lastName: "Tester",
        addressLine1: "Musterstr 1",
        postalCode: "12345",
        city: "Berlin",
        country: "DE",
        email: "guest@example.com",
      },
      sameAsBilling: true,
      clientPreview: {
        itemsTotalCents,
        shippingCents,
        totalCents,
      },
    };

    console.log("Calling checkout API...");

    const res = await fetch(
      "http://localhost:3000/api/checkout/create-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `cartId=${cart.id}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const json = await res.json();
    console.log("HTTP", res.status, json);

    // lookup order by cartId
    const order = await prisma.order.findFirst({where: {cartId: cart.id}});
    console.log(
      "Order in DB for cartId:",
      !!order,
      order
        ? {
            id: order.id,
            stripeSessionId: order.stripeSessionId,
            status: order.status,
            totalAmount: order.totalAmount,
          }
        : null,
    );

    await prisma.$disconnect();
  } catch (err) {
    console.error("Script error:", err);
    process.exit(1);
  }
})();
