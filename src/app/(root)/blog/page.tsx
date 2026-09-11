import React from "react";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import Image from "next/image";

const BlogPage = () => {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Blog", href: "/blog", active: true},
        ]}
      />

      <div aria-label="Blog-Übersicht" className="my-10">
        <h1 className="text-3xl font-semibold mb-6">Unser Blog</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
          <article className="bg-background/50 border border-foreground/10 rounded-md p-6">
            <header className="mb-3">
              <Image
                src="/shop/blog/werkstatt.png"
                alt="Blue Lill Ferseher Liege"
                width={600}
                height={400}
                className="mx-auto my-3 rounded-md"
              />
              <h2 className="text-xl font-bold">
                Update 2025 — Prototype ist fertiggestellt
              </h2>
              <p className="text-sm text-foreground/60 italic">
                Veröffentlicht: 18. April
              </p>
            </header>
            <p className="text-sm mb-4">
              <strong>Unsere neueste Werkstatt-Innovation.</strong>{" "}
              revolutioniert das Lounge-Erlebnis für anspruchsvolle Samtpfoten.
              Das multifunktionale Design-Möbelstück kombiniert minimalistische
              Ästhetik mit einem integrierten, hochauflösenden Natur-Bildschirm,
              der Vögel in Echtzeit simuliert und den Jagdinstinkt Ihrer Katze
              visuell anregt.Handwerkliche Perfektion & ErgonomieDas
              geschwungene, platzsparende Wandmöbel wurde ergonomisch perfekt an
              die Liegebedürfnisse von Katzen angepasst. Neben der luxuriösen,
              weich gepolsterten Liegefläche bietet die geschwungene Seitenwange
              eine integrierte Kratzfläche aus Premium-Sisal, die Krallenpflege
              und Komfort nahtlos vereint.Ein Statement-Piece für moderne
              WohnräumeVergessen Sie klassische, klobige Kratzbäume. Dieses in
              unserer Werkstatt konzipierte Meisterwerk fügt sich wie ein
              modernes Kunstwerk in Ihr Wohnambiente ein. Es verbindet
              exklusiven Wohnkomfort für die Katze mit modernstem
              Smart-Home-Design für den Halter.Möchten Sie diese
              Produktvorstellung direkt mit einem Messe-Gewinnspiel verknüpfen
              oder soll ich noch die technischen Details wie Display-Größe oder
              Stromversorgung ergänzen?KI-Antworten können Fehler enthalten.
              Weitere Informationen
            </p>
            <p className="text-sm mb-4">
              <strong>Handwerkliche Perfektion & Ergonomie.</strong> Das
              geschwungene, platzsparende Wandmöbel wurde ergonomisch perfekt an
              die Liegebedürfnisse von Katzen angepasst. Neben der luxuriösen,
              weich gepolsterten Liegefläche bietet die geschwungene Seitenwange
              eine integrierte Kratzfläche aus Premium-Sisal, die Krallenpflege
              und Komfort nahtlos vereint.
            </p>
            <p className="text-sm mb-4">
              <strong>Vergessen Sie klassische, klobige Kratzbäume.</strong>{" "}
              Dieses in unserer Werkstatt konzipierte Meisterwerk fügt sich wie
              ein modernes Kunstwerk in Ihr Wohnambiente ein. Es verbindet
              exklusiven Wohnkomfort für die Katze mit modernstem
              Smart-Home-Design für den Halter.
            </p>
          </article>

          <article className="bg-background/50 border border-foreground/10 rounded-md p-6">
            <header className="mb-3">
              <Image
                src="/shop/blog/tierfutter.png"
                alt="August Update"
                width={600}
                height={400}
                className="mx-auto my-3 rounded-md"
              />
              <h2 className="text-xl font-bold">
                Update 2025 — Fachverbandsmesse
              </h2>
              <p className="text-sm text-foreground/60 italic">
                Veröffentlicht: 21.August
              </p>
            </header>
            <p className="text-sm mb-4">
              <strong>Ergonomische Kratzbäume:</strong> Stilvolle Möbelstücke,
              die sich perfekt in Ihr Wohnambiente einfügen und die Gelenke
              sowie die Muskulatur Ihrer Katze beim Klettern und Dehnen optimal
              unterstützen.
            </p>
            <p className="text-sm mb-4">
              <strong>Hypoallergene Futtersorten:</strong> Kulinarische
              Spitzenleistungen aus erlesenen Zutaten, speziell entwickelt für
              sensible Feinschmecker, um Vitalität und ein glänzendes Fell zu
              fördern.
            </p>
            <p className="text-sm mb-4">
              <strong>Umweltfreundliches Spielzeug:</strong> Nachhaltige
              Materialien treffen auf intelligentes Design – für
              langanhaltenden, sicheren Spielspaß, der den natürlichen
              Jagdinstinkt weckt.
            </p>
          </article>

          <article className="bg-background/50 border border-foreground/10 rounded-md p-6">
            <header className="mb-3">
              <Image
                src="/shop/blog/umwelt.png"
                alt="September News"
                width={600}
                height={400}
                className="mx-auto my-3 rounded-md"
              />
              <h2 className="text-xl font-bold">
                September News — Umweltkonferenz 2026
              </h2>
              <p className="text-sm text-foreground/60 italic">
                Veröffentlicht: 22. September
              </p>
            </header>
            <p className="text-sm mb-4">
              <strong>Für uns bedeutet Premium auch Verantwortung.</strong>{" "}
              Unsere neue Linie setzt konsequent auf ressourcenschonende
              Produktion und nachwachsende Rohstoffe, um den ökologischen
              Pfotenabdruck maximal zu reduzieren.
            </p>
            <p className="text-sm mb-4">
              <strong>Wir verwenden ausschließlich zertifiziertes</strong>{" "}
              Echtholz, Naturfasern und recycelte Textilien. Das garantiert ein
              absolut schadstofffreies, sicheres Spiel- und Wohnerlebnis für
              Ihre Samtpfote.
            </p>
            <p className="text-sm mb-4">
              <strong>
                Vom regionalen Futtermittel bis zur vollständig recyclebaren
                Verpackung.
              </strong>{" "}
              Erleben Sie unsere Neuentwicklungen rund um das
              Verpackungskonzepte, wie moderne Luxusverpackungen und nachhaltige
              Materialien perfekt miteinander verschmelzen.
            </p>

            <p className="text-sm">
              Im September dreht sich alles um unsere Fellnasen. Neue tragfähige
              Konzepte rund um nachhaltige Produkte und umweltfreundliche
              Verpackungen stehen im Fokus.
            </p>
          </article>
          <article className="bg-background/50 border border-foreground/10 rounded-md p-6">
            <header className="mb-3">
              <Image
                src="/shop/blog/tierheim.png"
                alt="Tierheim Update"
                width={600}
                height={400}
                className="mx-auto my-3 rounded-md"
              />
              <h2 className="text-xl font-bold">
                Tierheim Rose Update — Neue Initiativen
              </h2>
              <p className="text-sm text-foreground/60 italic">
                Veröffentlicht: 10. Oktober
              </p>
            </header>
            <p className="text-sm mb-4">
              <strong>
                Premium-Qualität bedeutet für uns auch soziale Verantwortung.
              </strong>{" "}
              Wir freuen uns, auf der Messe unsere neue langfristige Kooperation
              mit dem lokalen Tierheim vorzustellen, um Katzen in Not ein
              besseres Leben zu ermöglichen.
            </p>
            <p className="text-sm mb-4">
              <strong>
                Durch unser Sponsoring stellen wir die komplette Versorgung des
                Tierheims mit unserer neuen, hochwertigen Nahrung und den
                ergonomischen Produkten sicher.
              </strong>{" "}
              So erhalten die Tiere genau die Qualität, die sie für eine
              schnelle Genesung brauchen.
            </p>
            <p className="text-sm mb-4">
              <strong>
                Unsere Unterstützung geht über Sachspenden hinaus.
              </strong>{" "}
              Neben Sachspenden finanzieren wir eine professionelle ärztliche
              Beratung und Betreuung vor Ort. Gemeinsam mit Tierärzten sichern
              wir die medizinische Versorgung und begleiten die Samtpfoten auf
              ihrem Weg in ein neues, liebevolles Zuhause.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
};

export default BlogPage;
