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

        <p className="mb-6 text-sm text-muted-foreground">
          Hinweis: Dies ist ein reiner Demo-/Lern-Text für den
          Blue‑Lilly‑Prototypen und ersetzt kein rechtsverbindliches Impressum.
          Für einen echten Shop benötigst du ein vollständiges, geprüftes
          Impressum nach § 5 TMG / § 18 MStV.
        </p>

        <section className="space-y-6">
          <div>
            <h3 className="font-bold mb-3">Angaben gemäß § 5 TMG</h3>
            <p>
              Blue Lilly the Catshop (Demo-Projekt)
              <br />
              Musterstraße 1<br />
              12345 Musterstadt
              <br />
              Deutschland
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">Vertreten durch</h3>
            <p>
              Max Mustermann (fiktiv)
              <br />
              (Geschäftsführung / Inhaber – Demo)
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">Kontakt</h3>
            <p>
              Telefon: +49 123 456789 (fiktiv)
              <br />
              E-Mail: info@bluelilly-catshop.demo (fiktiv)
            </p>
          </div>
        </section>
      </Card>
    </main>
  );
}
