import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";

export default function BarrierefreiheitPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Barrierefreiheit", href: "/barrierefreiheit", active: true},
        ]}
      />

      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-2xl font-bold mb-6">Barrierefreiheit</h1>
        <p className="mb-4">
          Platzhalterseite zur Barrierefreiheit. Beschreibe hier, welche
          Maßnahmen zur Zugänglichkeit der Website getroffen wurden.
        </p>
        <section className="prose">
          <h2>Kontrast &amp; Navigation</h2>
          <p>Informationen zur Kontrastgestaltung und Tastatur‑Navigation.</p>
          <h2>Kontakt für Barrierefreiheits‑Anfragen</h2>
          <p>E-Mail: accessibility@example.com</p>
        </section>
      </div>
    </main>
  );
}
