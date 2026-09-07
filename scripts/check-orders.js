// Minimal .env loader for this script (loads .env and .env.local if present)
const fs = require("fs");
function loadEnvFile(p) {
  try {
    if (!fs.existsSync(p)) return;
    const data = fs.readFileSync(p, "utf8");
    for (const line of data.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = val;
    }
  } catch (e) {
    // ignore
  }
}

loadEnvFile("./.env");
loadEnvFile("./.env.local");

const {PrismaClient} = require("../src/generated/prisma");
const {PrismaPg} = require("@prisma/adapter-pg");

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

async function main() {
  // Find recent orders (any status)
  const orders = await prisma.order.findMany({
    orderBy: {createdAt: "desc"},
    take: 10,
    include: {items: true},
  });

  if (orders.length === 0) {
    console.log("No PAID orders found");
    await prisma.$disconnect();
    return;
  }

  for (const order of orders) {
    console.log(
      "Order:",
      order.id,
      "status:",
      order.status,
      "stripeSessionId:",
      order.stripeSessionId,
      "stripePaymentIntentId:",
      order.stripePaymentIntentId,
      "createdAt:",
      order.createdAt,
    );
    for (const item of order.items) {
      console.log(
        "  OrderItem:",
        item.id,
        "optionId:",
        item.optionId,
        "quantity:",
        item.quantity,
      );
      if (item.optionId) {
        const opt = await prisma.option.findUnique({
          where: {id: item.optionId},
        });
        console.log(
          "    Option:",
          opt ? {id: opt.id, quantity: opt.quantity} : "not found",
        );
      }
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
