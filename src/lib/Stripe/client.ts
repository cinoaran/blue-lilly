import Stripe from "stripe";

// Lazy-initialize Stripe so importing this module doesn't throw when env vars are missing.
let _stripe: Stripe | null = null;
function initStripe(): Stripe {
  if (_stripe) return _stripe;
  const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;
  if (!stripeKey) {
    throw new Error(
      "Missing Stripe secret key. Set STRIPE_SECRET_KEY or STRIPE_API_KEY in the environment.",
    );
  }
  _stripe = new Stripe(stripeKey, {
    apiVersion: "2026-07-29.dahlia",
    typescript: true,
  });
  return _stripe;
}

// Export a proxy that initializes Stripe on first access. This prevents import-time
// exceptions while preserving the original `stripe` usage API.
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    const s = initStripe();
    // @ts-expect-error dynamic property access
    return s[prop as keyof Stripe];
  },
  apply(_, __, args) {
    const s = initStripe();
    // @ts-expect-error
    return (s as any).apply(undefined, args);
  },
});

/**
 * Convert a decimal money value (e.g. 12.34) to Stripe's smallest currency unit (e.g. cents)
 */
export function toStripeAmount(value: number) {
  return Math.round(value * 100);
}

/**
 * Convert from Stripe's smallest currency unit (e.g. cents) back to decimal money value
 */
export function fromStripeAmount(value: number) {
  return value / 100;
}

/**
 * Format arbitrary metadata values into the string-only object Stripe expects.
 * Filters out undefined/null values.
 */
export function formatMetadata(
  meta: Record<string, string | number | boolean | null | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(meta)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );
}

/**
 * Verify and construct a Stripe Webhook Event using the raw payload and signature header.
 * - `payload` should be the raw request body (string or Buffer)
 * - `sigHeader` should be the value of the `stripe-signature` header
 * - `endpointSecret` optionally overrides `process.env.STRIPE_WEBHOOK_SECRET`
 */
export function constructStripeEvent(
  payload: string | Buffer,
  sigHeader: string | null | undefined,
  endpointSecret?: string,
): Stripe.Event {
  const secret = endpointSecret ?? process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret)
    throw new Error("Missing Stripe webhook secret (STRIPE_WEBHOOK_SECRET)");
  if (!sigHeader) throw new Error("Missing stripe-signature header");
  return stripe.webhooks.constructEvent(payload, sigHeader, secret);
}
