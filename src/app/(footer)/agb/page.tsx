import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {Card} from "@/components/ui/card";

export default function AgbPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "AGB", href: "/agb", active: true},
        ]}
      />
      <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
        <h2 className="font-bold mb-6">AGB</h2>
        <p className="mb-6">
          Allgemeine Geschäftsbedingungen (AGB) – Platzhaltertext. Bitte ergänze
          hier die vollständigen Geschäftsbedingungen deines Shops.
        </p>
        <section>
          <h3 className="font-bold mb-6">Leistungsbeschreibung</h3>
          <p>Beschreibung der angebotenen Produkte und Dienstleistungen.</p>
          <h3 className="font-bold my-6">Vertragsabschluss</h3>
          <p>Informationen zum Zustandekommen des Vertrags.</p>
        </section>
      </Card>
    </main>
  );
}
