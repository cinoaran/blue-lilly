import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {Card} from "@/components/ui/card";

export default function AgbPage() {
  return (
    <main className="container relative mx-auto w-full">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "AGB", href: "/agb", active: true},
        ]}
      />
      <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
        <h2 className="font-bold mb-6">AGB</h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Hinweis: Dies ist ein reiner Demo-/Lern-Text für den
          Blue‑Lilly‑Prototypen und ersetzt keine rechtsverbindlichen AGB. Für
          einen echten Shop benötigst du individuell geprüfte Rechtstexte (z. B.
          Generator/Anwalt).
        </p>

        <section className="space-y-6">
          <div>
            <h3 className="font-bold mb-3">§ 1 Geltungsbereich</h3>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle
              Verträge zwischen der Blue Lilly the Catshop (Demo-Projekt) und
              dem Kunden, die über diesen Onlineshop abgeschlossen werden.
              Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei
              denn, wir stimmen ihnen ausdrücklich schriftlich zu.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">§ 2 Vertragspartner</h3>
            <p>
              Vertragspartner ist die Blue Lilly the Catshop (Demo),
              Musterstraße 1, 12345 Musterstadt, Deutschland, E‑Mail:
              demo@bluelilly-catshop.demo (fiktiv). Alle Angaben sind im Rahmen
              dieses Prototyps fiktiv.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">§ 3 Vertragsschluss</h3>
            <p>
              Die Darstellung der Produkte im Onlineshop ist unverbindlich. Mit
              dem Anklicken des Buttons „Kostenpflichtig bestellen“ gibst du
              eine verbindliche Bestellung ab. Der Vertrag kommt mit unserer
              Auftragsbestätigung per E‑Mail oder mit dem Versand der Ware
              zustande.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">§ 4 Preise und Zahlung</h3>
            <p>
              Alle Preise verstehen sich einschließlich der gesetzlichen
              Umsatzsteuer und zzgl. eventueller Versandkosten. In diesem
              Demo‑Shop werden keine echten Zahlungen durchgeführt;
              Zahlungsarten sind nur simuliert.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">§ 5 Lieferung</h3>
            <p>
              Die Lieferung erfolgt innerhalb Deutschlands. In diesem Prototyp
              wird kein tatsächlicher Versand durchgeführt; Lieferzeiten und
              Versandmodalitäten sind lediglich beispielhaft abgebildet.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">§ 6 Widerrufsrecht (Hinweis)</h3>
            <p>
              Verbrauchern steht grundsätzlich ein 14‑tägiges Widerrufsrecht
              nach § 355 BGB zu, sofern keine gesetzlichen Ausnahmen greifen.
              Für einen echten Shop ist eine vollständige, aktuelle
              Widerrufsbelehrung mit Muster‑Widerrufsformular zwingend
              erforderlich.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">§ 7 Gewährleistung und Haftung</h3>
            <p>
              Es gelten die gesetzlichen Mängelrechte. Haftungsbeschränkungen
              müssten im echten Betrieb sorgfältig und rechtskonform formuliert
              werden. In diesem Demo‑Projekt dient dieser Abschnitt nur der
              Veranschaulichung.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">§ 8 Eigentumsvorbehalt</h3>
            <p>
              Bis zur vollständigen Zahlung bleibt die gelieferte Ware im
              Eigentum des Anbieters. Im Demo‑Modus ohne reale Bedeutung.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">§ 9 Datenschutz</h3>
            <p>
              Im echten Betrieb sind hier datenschutzrelevante Hinweise zu
              integrieren oder klar auf die Datenschutzerklärung zu verweisen
              (DSGVO). In diesem Prototyp wird dies nur angedeutet.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">§ 10 Schlussbestimmungen</h3>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand
              ist, soweit gesetzlich zulässig, der Sitz des Anbieters. Sollte
              eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit
              der übrigen Bestimmungen unberührt.
            </p>
          </div>
        </section>
      </Card>
    </main>
  );
}
