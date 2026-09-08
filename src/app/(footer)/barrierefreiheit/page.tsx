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
        <h2 className="font-bold mb-6">Erklärung zur Barrierefreiheit</h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Hinweis: Dies ist eine Demo-Erklärung für den Blue‑Lilly‑Prototypen
          und erfüllt nicht die Anforderungen des BFSG / BGG / BITV 2.0 für
          einen echten Shop. Sie dient nur der Veranschaulichung im Rahmen der
          Umschulung.
        </p>

        <section className="space-y-6">
          <div>
            <h3 className="font-bold mb-3">1. Ziel dieser Erklärung</h3>
            <p>
              Wir möchten unseren Onlineshop für alle Menschen zugänglich machen
              – unabhängig von körperlichen oder technischen Voraussetzungen.
              Diese Erklärung beschreibt den aktuellen Stand der
              Barrierefreiheit im Blue‑Lilly‑Demo‑Projekt und geplante
              Verbesserungen.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">2. Stand der Umsetzung</h3>
            <p>
              Dieser Shop ist ein Prototyp im Rahmen einer Umschulung zum
              Kaufmann bzw. zur Kauffrau im E‑Commerce. Viele Funktionen sind
              noch nicht vollständig umgesetzt. Wir orientieren uns an den
              Prinzipien der Web Content Accessibility Guidelines (WCAG) 2.1,
              Level AA.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">3. Bereits umgesetzte Maßnahmen</h3>
            <p>Im aktuellen Prototyp wurden folgende Aspekte berücksichtigt:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Semantische HTML-Struktur mit Überschriften (H1–H3) und
                Abschnitten
              </li>
              <li>Verwendung von aussagekräftigen Link- und Button-Texten</li>
              <li>Farbkontraste, die nach aktueller Prüfung gut lesbar sind</li>
              <li>Responsive Design für verschiedene Bildschirmgrößen</li>
              <li>Formulare mit Beschriftungen (Labels) für Eingabefelder</li>
              <li>Alt-Texte für Bilder, soweit Bilder verwendet werden</li>
              <li>
                Tastaturnavigation für wesentliche Funktionen (Menü, Warenkorb,
                Checkout)
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">4. Bekannte Einschränkungen</h3>
            <p>
              Trotz der genannten Maßnahmen gibt es im aktuellen Demo‑Stand noch
              bekannte Einschränkungen:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Nicht alle interaktiven Komponenten sind vollständig mit
                Screenreadern getestet
              </li>
              <li>
                Fokus-Indikatoren sind teilweise noch nicht optimal sichtbar
              </li>
              <li>
                Einige dynamische Inhalte (z. B. Warenkorb-Updates) sind nicht
                vollständig mit ARIA-Live-Regionen ausgestattet
              </li>
              <li>
                PDFs oder andere herunterladbare Dokumente sind nicht immer
                barrierefrei
              </li>
            </ul>
          </div>
        </section>
      </Card>
    </main>
  );
}
