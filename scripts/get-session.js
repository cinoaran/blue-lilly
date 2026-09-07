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
  } catch (e) {}
}
loadEnvFile("./.env");
loadEnvFile("./.env.local");

const Stripe = require("stripe");
const stripe = new Stripe(
  process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY,
);

const sessionId = process.argv[2];
if (!sessionId) {
  console.error("Usage: node scripts/get-session.js <sessionId>");
  process.exit(1);
}

(async () => {
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
    console.log(JSON.stringify(s, null, 2));
  } catch (e) {
    console.error("Error fetching session", e);
  }
})();
