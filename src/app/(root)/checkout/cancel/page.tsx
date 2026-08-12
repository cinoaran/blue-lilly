// app/checkout/cancel/page.tsx
import Link from "next/link";

export default function CancelPage() {
  return (
    <div>
      <h1>Bezahlung abgebrochen</h1>
      <p>Dein Warenkorb wurde nicht abgeschlossen.</p>
      <Link href="/cart">Zurück zum Warenkorb</Link>
    </div>
  );
}
