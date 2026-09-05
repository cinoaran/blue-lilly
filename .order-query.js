const { PrismaClient } = require("./src/generated/prisma");
const p = new PrismaClient();
(async () => {
  try {
    const order = await p.order.findUnique({
      where: { id: "cmtouvars00000ci038sccuwc" },
      include: { items: { include: { option: true } } }
    });
    console.log(JSON.stringify(order, null, 2));
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await p.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});