import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";

export default function DatenschutzPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Datenschutzerklärung", href: "/datenschutz", active: true},
        ]}
      />

      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-2xl font-bold mb-6">Datenschutzerklärung</h1>
        <p className="mb-4">
          Diese Seite enthält unsere Datenschutzerklärung. Bitte ersetze diesen
          Platzhalter durch den vollständigen Text eurer Datenschutzbelehrung,
          der Informationen über die Verarbeitung personenbezogener Daten,
          Rechtsgrundlagen, Speicherdauer, Betroffenenrechte und
          Kontaktmöglichkeiten enthalten muss.
        </p>
        <section className="prose">
          <h2>Kontakt</h2>
          <p>
            Bei Fragen zum Datenschutz erreichen Sie uns unter: info@example.com
          </p>
          <h2>Cookies</h2>
          <p>
            Informationen über eingesetzte Cookies und Zweckbeschreibungen
            gehören hierher.
          </p>
        </section>
      </div>
    </main>
  );
}
