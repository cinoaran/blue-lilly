import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {Card} from "@/components/ui/card";

export default function BarrierefreiheitPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Barrierefreiheit", href: "/barrierefreiheit", active: true},
        ]}
      />

      <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
        <h2 className="font-bold mb-6">Barrierefreiheit</h2>
        <p className="mb-6">
          Platzhalterseite zur Barrierefreiheit. Beschreibe hier, welche
          Maßnahmen zur Zugänglichkeit der Website getroffen wurden.
        </p>
        <section>
          <h3 className="font-bold mb-6">Kontrast &amp; Navigation</h3>
          <p>Informationen zur Kontrastgestaltung und Tastatur‑Navigation.</p>
          <h3 className="font-bold my-6">
            Kontakt für Barrierefreiheits‑Anfragen
          </h3>
          <p>E-Mail: accessibility@example.com</p>
        </section>
      </Card>
    </main>
  );
}
