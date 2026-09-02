import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";

export default function WiderrufPage() {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Widerrufsrecht", href: "/widerruf", active: true},
        ]}
      />

      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-2xl font-bold mb-6">Widerrufsrecht</h1>
        <p className="mb-4">
          Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Die folgenden
          Informationen dienen als Platzhalter. Bitte ersetze sie durch die
          rechtlich geprüften Angaben eures Widerrufsbelehrungstextes (Fristen,
          Ausnahmen, Rücksendemodalitäten, Muster-Widerrufsformular etc.).
        </p>
        <section className="prose">
          <h2>Widerrufsfrist</h2>
          <p>
            Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
            diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
            Tage ab dem Tag, an dem du oder ein von dir benannter Dritter die
            Waren in Besitz genommen haben.
          </p>
          <h2>Folgen des Widerrufs</h2>
          <p>
            Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die
            wir von dir erhalten haben, einschließlich der Lieferkosten (mit
            Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass du
            eine andere Art der Lieferung als die von uns angebotene, günstigste
            Standardlieferung gewählt hast), unverzüglich und spätestens binnen
            vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
            deinen Widerruf dieses Vertrags bei uns eingegangen ist.
          </p>
          <h2>Muster-Widerrufsformular</h2>
          <p>
            (Wenn du den Vertrag widerrufen willst, dann fülle dieses Formular
            aus und sende es zurück.)
          </p>
        </section>
      </div>
    </main>
  );
}
