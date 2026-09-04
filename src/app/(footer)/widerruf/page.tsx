import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {Card} from "@/components/ui/card";
export default function WiderrufPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Widerrufsrecht", href: "/widerruf", active: true},
        ]}
      />

      <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
        <h2 className="font-bold mb-6">Widerrufsrecht</h2>
        <p className="mb-6">
          Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Die folgenden
          Informationen dienen als Platzhalter. Bitte ersetze sie durch die
          rechtlich geprüften Angaben eures Widerrufsbelehrungstextes (Fristen,
          Ausnahmen, Rücksendemodalitäten, Muster-Widerrufsformular etc.).
        </p>
        <section>
          <h3>Widerrufsfrist</h3>
          <p className="mb-6">
            Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
            diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
            Tage ab dem Tag, an dem du oder ein von dir benannter Dritter die
            Waren in Besitz genommen haben.
          </p>
          <h3>Folgen des Widerrufs</h3>
          <p className="mb-6">
            Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die
            wir von dir erhalten haben, einschließlich der Lieferkosten (mit
            Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass du
            eine andere Art der Lieferung als die von uns angebotene, günstigste
            Standardlieferung gewählt hast), unverzüglich und spätestens binnen
            vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
            deinen Widerruf dieses Vertrags bei uns eingegangen ist.
          </p>
          <h3>Muster-Widerrufsformular</h3>
          <p className="mb-6">
            (Wenn du den Vertrag widerrufen willst, dann fülle dieses Formular
            aus und sende es zurück.)
          </p>
        </section>
      </Card>
    </main>
  );
}
