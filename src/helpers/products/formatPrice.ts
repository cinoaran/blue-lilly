export default function formatPrice(price: number | string): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price));
}
