"use client";

import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {Card} from "@/components/ui/card";
import {useState} from "react";

export default function CookieSettingsPage() {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {
            label: "Cookie-Einstellungen",
            href: "/cookie-einstellungen",
            active: true,
          },
        ]}
      />
      <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
        <h2 className="font-bold mb-6">Cookie-Einstellungen</h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Hinweis: Dies ist eine Demo-Oberfläche für den Blue‑Lilly‑Prototypen.
          In einem echten Shop müssten Cookie-Einwilligungen rechtskonform
          (DSGVO, TTDSG) umgesetzt werden, inkl. echter Speicherlogik und
          Anbieterliste.
        </p>

        <section className="space-y-6">
          <div>
            <h3 className="font-bold mb-3">1. Was sind Cookies?</h3>
            <p>
              Cookies sind kleine Textdateien, die auf deinem Gerät gespeichert
              werden, wenn du eine Website besuchst. Sie helfen dabei, die
              Website funktionsfähig zu halten, die Nutzererfahrung zu
              verbessern und statistische Auswertungen zu erstellen. In diesem
              Demo‑Projekt werden keine echten Tracking-Cookies gesetzt.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">2. Kategorien von Cookies</h3>
            <p>
              Im echten Betrieb würden Cookies typischerweise in folgende
              Kategorien eingeteilt:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Notwendige Cookies:</strong> Unverzichtbar für
                Grundfunktionen wie Warenkorb, Login und Sicherheit. Diese
                Cookies dürfen auch ohne Einwilligung gesetzt werden.
              </li>
              <li>
                <strong>Funktionale Cookies:</strong> Speichern Präferenzen wie
                Sprache, Währung oder Login-Status, um die Nutzung komfortabler
                zu gestalten.
              </li>
              <li>
                <strong>Statistik-Cookies:</strong> Erfassen anonymisierte Daten
                zur Nutzung der Website (z. B. besuchte Seiten, Verweildauer),
                um das Angebot zu verbessern.
              </li>
              <li>
                <strong>Marketing-Cookies:</strong> Werden verwendet, um dir
                personalisierte Werbung anzuzeigen und Kampagnen zu messen (z.
                B. Pixel, Retargeting).
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">3. Deine Einstellungen (Demo)</h3>
            <p>
              In einem echten Shop würdest du hier jede Kategorie einzeln
              aktivieren oder deaktivieren können. In diesem Prototyp sind alle
              Optionen nur simuliert und haben keine echte technische Wirkung.
            </p>

            <div className="mt-4 space-y-4 border rounded-md p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-necessary"
                  checked
                  disabled
                  className="mt-1"
                />
                <div>
                  <label htmlFor="cookie-necessary" className="font-medium">
                    Notwendige Cookies
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Immer aktiv. Diese Cookies sind für den Betrieb des Shops
                    erforderlich und können nicht deaktiviert werden.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-functional"
                  className="mt-1"
                />
                <div>
                  <label htmlFor="cookie-functional" className="font-medium">
                    Funktionale Cookies
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Speichern deine Präferenzen und verbessern die
                    Benutzerfreundlichkeit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-statistics"
                  className="mt-1"
                />
                <div>
                  <label htmlFor="cookie-statistics" className="font-medium">
                    Statistik-Cookies
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Helfern uns, die Nutzung der Website anonymisiert
                    auszuwerten.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" id="cookie-marketing" className="mt-1" />
                <div>
                  <label htmlFor="cookie-marketing" className="font-medium">
                    Marketing-Cookies
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Ermöglichen personalisierte Werbung und Messung von
                    Kampagnen.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
                disabled
              >
                Auswahl speichern (Demo)
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md border"
                disabled
              >
                Alle ablehnen (Demo)
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md border"
                disabled
              >
                Alle akzeptieren (Demo)
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3">
              4. Cookies in diesem Demo-Projekt
            </h3>
            <p>
              In diesem Prototyp werden keine echten Tracking- oder
              Marketing-Cookies gesetzt. Lokale Speicherungen (z. B.
              localStorage, Session) dienen nur der Veranschaulichung von
              Warenkorb- und Session-Logik.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">5. Cookies verwalten und löschen</h3>
            <p>
              Du kannst Cookies jederzeit in deinem Browser verwalten,
              blockieren oder löschen. Die genaue Vorgehensweise hängt von
              deinem Browser ab (z. B. Chrome, Firefox, Safari, Edge). In den
              Browsereinstellungen findest du Optionen zur Verwaltung von
              Cookies und Website-Daten.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">6. Hinweis zur Rechtskonformität</h3>
            <p>
              Für einen echten, öffentlich zugänglichen Shop müssten
              Cookie-Einwilligungen rechtskonform nach DSGVO und TTDSG umgesetzt
              werden, inkl. echter Speicherlogik, Nachweisbarkeit und einer
              vollständigen Liste aller eingesetzten Dienste (z. B. Google,
              Meta, Stripe, etc.).
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">7. Kontakt</h3>
            <p>
              Bei Fragen zu Cookies und Datenschutz kannst du uns im
              Demo-Projekt kontaktieren unter:
            </p>
            <p className="mt-3">
              Blue Lilly the Catshop (Demo-Projekt)
              <br />
              E‑Mail: demo@bluelilly-catshop.demo (fiktiv)
            </p>
          </div>
        </section>
      </Card>
    </main>
  );
}
