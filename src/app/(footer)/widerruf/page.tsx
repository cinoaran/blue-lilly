import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {Card} from "@/components/ui/card";
export default function WiderrufPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Widerruf", href: "/widerruf", active: true},
        ]}
      />
      <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
        <h2 className="font-bold mb-6">Widerrufsbelehrung</h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Hinweis: Dies ist eine Demo-Widerrufsbelehrung für den
          Blue‑Lilly‑Prototypen und ersetzt keine rechtsverbindliche Belehrung.
          Für einen echten Shop benötigst du eine aktuelle, individuell geprüfte
          Widerrufsbelehrung nach § 355 BGB.
        </p>

        <section className="space-y-6">
          <div>
            <h3 className="font-bold mb-3">Widerrufsrecht</h3>
            <p>
              Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
              diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
              Tage ab dem Tag, an dem du oder ein von dir benannter Dritter, der
              nicht der Beförderer ist, die letzte Ware in Besitz genommen hast
              bzw. hat.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">Ausübung des Widerrufsrechts</h3>
            <p>
              Um dein Widerrufsrecht auszuüben, musst du uns (Blue Lilly the
              Catshop, Demo-Projekt, Musterstraße 1, 12345 Musterstadt,
              Deutschland, E‑Mail: demo@bluelilly-catshop.demo, Telefon: +49 (0)
              123 456789 – alles fiktiv) mittels einer eindeutigen Erklärung (z.
              B. ein mit der Post versandter Brief, Telefax oder E‑Mail) über
              deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Du
              kannst dafür das untenstehende Muster-Widerrufsformular verwenden,
              das jedoch nicht vorgeschrieben ist.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">Folgen des Widerrufs</h3>
            <p>
              Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen,
              die wir von dir erhalten haben, einschließlich der Lieferkosten
              (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben,
              dass du eine andere Art der Lieferung als die von uns angebotene,
              günstigste Standardlieferung gewählt hast), unverzüglich und
              spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem
              die Mitteilung über deinen Widerruf dieses Vertrags bei uns
              eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe
              Zahlungsmittel, das du bei der ursprünglichen Transaktion
              eingesetzt hast, es sei denn, mit dir wurde ausdrücklich etwas
              anderes vereinbart; in keinem Fall werden dir wegen dieser
              Rückzahlung Entgelte berechnet.
            </p>
          </div>
        </section>
      </Card>
    </main>
  );
}
