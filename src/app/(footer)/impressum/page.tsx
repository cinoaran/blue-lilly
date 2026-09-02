import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";

export default function ImpressumPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Impressum", href: "/impressum", active: true},
        ]}
      />

      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-2xl font-bold mb-6">Impressum</h1>
        <p className="mb-4">
          Dieses Impressum ist ein Platzhalter. Ersetze diesen Text durch die
          vollständigen Angaben gemäß § 5 TMG / entsprechender nationaler
          Regelungen, einschließlich Name, Anschrift, Vertretungsberechtigte,
          Kontaktinformationen, Handelsregister,
          Umsatzsteuer-Identifikationsnummer etc.
        </p>
        <section className="prose">
          <h2>Anschrift</h2>
          <p>Beispielstraße 1, 12345 Ort</p>
          <h2>Kontakt</h2>
          <p>Telefon: +49 123 456789 | E-Mail: info@example.com</p>
        </section>
      </div>
    </main>
  );
}
