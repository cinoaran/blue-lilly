import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";

export default function AgbPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "AGB", href: "/agb", active: true},
        ]}
      />
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-2xl font-bold mb-6">AGB</h1>
        <p className="mb-4">
          Allgemeine Geschäftsbedingungen (AGB) – Platzhaltertext. Bitte ergänze
          hier die vollständigen Geschäftsbedingungen deines Shops.
        </p>
        <section className="prose">
          <h2>Leistungsbeschreibung</h2>
          <p>Beschreibung der angebotenen Produkte und Dienstleistungen.</p>
          <h2>Vertragsabschluss</h2>
          <p>Informationen zum Zustandekommen des Vertrags.</p>
        </section>
      </div>
    </main>
  );
}
