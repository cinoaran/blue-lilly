const {PrismaClient} = require("../src/generated/prisma/index.js");
const {PrismaPg} = require("@prisma/adapter-pg");
const crypto = require("crypto");

async function main() {
  const token = process.argv[2];
  if (!token) {
    console.error("Usage: node scripts/check_token.js <token>");
    process.exit(2);
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    const fs = require("fs");
    try {
      const env = fs.readFileSync(".env", "utf8");
      const m = env.match(
        /^\s*DATABASE_URL\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/m,
      );
      connectionString = (m && (m[1] || m[2] || m[3])) || undefined;
    } catch (err) {
      // ignore
    }
  }

  const adapter = new PrismaPg({connectionString});
  const prisma = new PrismaClient({adapter});
  try {
    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: {confirmationTokenHash: tokenHash},
      select: {
        id: true,
        email: true,
        emailNormalized: true,
        status: true,
        confirmationTokenHash: true,
        confirmationExpiresAt: true,
        confirmedAt: true,
        unsubscribedAt: true,
      },
    });

    if (!subscriber) {
      console.log(JSON.stringify({found: false, tokenHash}, null, 2));
      process.exit(0);
    }

    console.log(JSON.stringify({found: true, subscriber}, null, 2));
  } catch (e) {
    console.error("Error querying DB:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
