import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {Card} from "@/components/ui/card";

export default function DatenschutzPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Datenschutz", href: "/datenschutz", active: true},
        ]}
      />
      <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
        <h2 className="font-bold mb-6">Datenschutzerklärung</h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Hinweis: Dies ist ein reiner Demo-/Lern-Text für den
          Blue‑Lilly‑Prototypen und ersetzt keine rechtsverbindliche
          Datenschutzerklärung. Für einen echten Shop benötigst du individuell
          geprüfte Rechtstexte (DSGVO-konform).
        </p>

        <section className="space-y-6">
          <div>
            <h3 className="font-bold mb-3">1. Verantwortlicher</h3>
            <p>
              Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO)
              ist die Blue Lilly the Catshop (Demo-Projekt), Musterstraße 1,
              12345 Musterstadt, Deutschland, E‑Mail:
              demo@bluelilly-catshop.demo (fiktiv). Alle Angaben sind im Rahmen
              dieses Prototyps fiktiv.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">
              2. Erhebung und Verarbeitung personenbezogener Daten
            </h3>
            <p>
              Wir erheben und verarbeiten personenbezogene Daten nur, soweit
              dies für die Bereitstellung unseres Onlineshops erforderlich ist.
              Dazu gehören insbesondere Name, Anschrift, E-Mail-Adresse und
              Zahlungsinformationen. Alle Daten werden gemäß den gesetzlichen
              Datenschutzbestimmungen behandelt.
            </p>
          </div>
        </section>
      </Card>
    </main>
  );
}
