import React from "react";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {Card} from "@/components/ui/card";
import Image from "next/image";

const FaqPage = () => {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "FAQ", href: "/faq", active: true},
        ]}
      />

      <Card className="relative z-20 w-[85vw] md:w-[40vw] mx-auto my-16 p-12">
        <h1 className="text-3xl font-semibold mb-6">Häufige Fragen (FAQ)</h1>

        <Accordion type="single" collapsible className="w-full">
          <div className="bg-background/50 border border-foreground/10 rounded-md p-4 mb-4">
            <AccordionItem value="shipping" className="border-none">
              <AccordionTrigger className="text-lg font-semibold">
                Wie schnell versendet ihr meine Bestellung?
              </AccordionTrigger>
              <AccordionContent>
                In der Regel versenden wir innerhalb von 1–3 Werktagen.
                Lieferzeiten können je nach Verfügbarkeit und Lieferadresse
                variieren.
              </AccordionContent>
            </AccordionItem>
          </div>

          <div className="bg-background/50 border border-foreground/10 rounded-md p-4 mb-4">
            <AccordionItem value="returns" className="border-none">
              <AccordionTrigger className="text-lg font-semibold">
                Wie funktioniert die Rückgabe?
              </AccordionTrigger>
              <AccordionContent>
                Du kannst unbenutzte Artikel innerhalb von 14 Tagen nach Erhalt
                zurücksenden. Kontaktiere unseren Support für ein
                Rücksendeetikett und Anweisungen.
              </AccordionContent>
            </AccordionItem>
          </div>

          <div className="bg-background/50 border border-foreground/10 rounded-md p-4 mb-4">
            <AccordionItem value="payment" className="border-none">
              <AccordionTrigger className="text-lg font-semibold">
                Welche Zahlungsmethoden akzeptiert ihr?
              </AccordionTrigger>
              <AccordionContent>
                Wir akzeptieren Kreditkarte, PayPal, Klarna und
                Sofortüberweisung. Weitere Zahlungsmöglichkeiten können je nach
                Land verfügbar sein.
              </AccordionContent>
            </AccordionItem>
          </div>

          <div className="bg-background/50 border border-foreground/10 rounded-md p-4 mb-4">
            <AccordionItem value="food" className="border-none">
              <AccordionTrigger className="text-lg font-semibold">
                Meine Katze hat Allergien — wie wähle ich das richtige Futter?
              </AccordionTrigger>
              <AccordionContent>
                Wir bieten hypoallergene und getreidefreie Optionen an. Schau
                dir die Produktbeschreibungen an oder kontaktiere unseren
                Kundenservice für eine persönliche Empfehlung.
              </AccordionContent>
            </AccordionItem>
          </div>

          <div className="bg-background/50 border border-foreground/10 rounded-md p-4 mb-4">
            <AccordionItem value="delivery" className="border-none">
              <AccordionTrigger className="text-lg font-semibold">
                Kann ich die Lieferung an eine Packstation liefern lassen?
              </AccordionTrigger>
              <AccordionContent>
                Ja, die Lieferung an Packstationen ist möglich, sofern die
                gewählte Versandart dies unterstützt. Gib die
                Packstations-Adresse bei der Bestellung an.
              </AccordionContent>
            </AccordionItem>
          </div>

          <div className="bg-background/50 border border-foreground/10 rounded-md p-4 mb-4">
            <AccordionItem value="giftcard" className="border-none">
              <AccordionTrigger className="text-lg font-semibold">
                Bietet ihr Geschenkgutscheine an?
              </AccordionTrigger>
              <AccordionContent>
                Ja, digitale Geschenkgutscheine sind verfügbar und können beim
                Checkout eingelöst werden.
              </AccordionContent>
            </AccordionItem>
          </div>
        </Accordion>
      </Card>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-0 hidden md:block">
        <Image
          src="/shop/blue-lilly-image/lilly-black-green-eyes.png"
          alt="FAQ Image"
          width={420}
          height={420}
          className="object-contain"
          sizes="(max-width: 800px) 50vw, 420px"
        />
      </div>
    </main>
  );
};

export default FaqPage;
