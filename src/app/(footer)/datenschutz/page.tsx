import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {Card} from "@/components/ui/card";

export default function DatenschutzPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Datenschutzerklärung", href: "/datenschutz", active: true},
        ]}
      />

      <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
        <h2 className="font-bold mb-6">Datenschutzerklärung</h2>
        <p className="mb-4">
          Diese Seite enthält unsere Datenschutzerklärung. Bitte ersetze diesen
          Platzhalter durch den vollständigen Text eurer Datenschutzbelehrung,
          der Informationen über die Verarbeitung personenbezogener Daten,
          Rechtsgrundlagen, Speicherdauer, Betroffenenrechte und
          Kontaktmöglichkeiten enthalten muss.
        </p>
        <section>
          <h3 className="font-bold mb-6">Kontakt</h3>
          <p>
            Bei Fragen zum Datenschutz erreichen Sie uns unter: info@example.com
          </p>
          <h3 className="font-bold my-6">Cookies</h3>
          <p>
            Informationen über eingesetzte Cookies und Zweckbeschreibungen
            gehören hierher.
          </p>
        </section>
      </Card>
    </main>
  );
}
