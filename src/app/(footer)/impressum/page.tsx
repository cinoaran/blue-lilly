import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {Card} from "@/components/ui/card";
export default function ImpressumPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Impressum", href: "/impressum", active: true},
        ]}
      />

      <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
        <h2 className="font-bold mb-6">Impressum</h2>
        <p className="mb-6">
          Dieses Impressum ist ein Platzhalter. Ersetze diesen Text durch die
          vollständigen Angaben gemäß § 5 TMG / entsprechender nationaler
          Regelungen, einschließlich Name, Anschrift, Vertretungsberechtigte,
          Kontaktinformationen, Handelsregister,
          Umsatzsteuer-Identifikationsnummer etc.
        </p>
        <section>
          <h3 className="font-bold mb-6">Anschrift</h3>
          <p>Beispielstraße 1, 12345 Ort</p>
          <h4 className="font-bold my-6">Kontakt</h4>
          <p>Telefon: +49 123 456789 | E-Mail: info@example.com</p>
        </section>
      </Card>
    </main>
  );
}
