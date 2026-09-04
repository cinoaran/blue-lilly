import * as React from "react";

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

export default function BlueLillyAutumnNewsletter() {
  const main = {
    backgroundColor: "#f4f1ea",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    padding: "40px 0",
  };

  const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "600px",
  };

  const content = {
    padding: "40px 40px 20px 40px",
  };

  const sectionHeading = {
    color: "#8b5e3c",
    fontSize: "22px",
    fontWeight: "700",
    lineHeight: "1.3",
    margin: "24px 0 12px 0",
  };

  const paragraph = {
    color: "#4a4a4a",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
  };

  const veggieCard = {
    backgroundColor: "#faf7f2",
    padding: "16px",
    marginBottom: "16px",
    borderLeft: "4px solid #d97706",
  };

  const veggieTitle = {
    color: "#292524",
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 4px 0",
  };

  const shelterBox = {
    backgroundColor: "#fff7ed",
    padding: "24px",
    border: "2px dashed #e28743",
    marginTop: "32px",
  };

  const button = {
    backgroundColor: "#e28743",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "100%",
    padding: "14px 0",
    marginTop: "16px",
  };

  const footer = {
    backgroundColor: "#1e293b",
    padding: "30px 40px",
    textAlign: "center" as const,
  };

  const footerText = {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "0 0 10px 0",
  };

  return (
    <Html lang="de">
      <Head />
      <Preview>
        Herbst-Spezial: Lilly&apos;s Top Gemüsesorten & exklusive Berliner
        Gesundheitsaktion 🍂
      </Preview>
      <Body style={main}>
        <div style={container}>
          <Section style={content}>
            <Heading
              style={{
                color: "#2c3e50",
                fontSize: "26px",
                fontWeight: "800",
                marginTop: "0",
              }}
            >
              Kuschelzeit & Vitalität im Herbst 🍂
            </Heading>
            <Text style={paragraph}>
              Hallo liebe Katzen-Community,
              <br />
              <br />
              die Tage werden kürzer, die Decken gemütlicher – der Herbst ist
              da! Für unsere Samtpfoten bedeutet diese Jahreszeit nicht nur
              intensives Kuscheln, sondern auch eine Umstellung des Körpers. Der
              Fellwechsel läuft auf Hochtouren und das Immunsystem fordert
              Extra-Energie.
            </Text>

            <Hr style={{borderColor: "#e2e8f0", margin: "30px 0"}} />

            <Heading style={sectionHeading}>
              🥕 Lilly’s Top Gemüsesorten für den Herbst
            </Heading>
            <Text style={paragraph}>
              Katzen sind Fleischfresser, das ist klar. Doch kleine Mengen des
              richtigen Gemüses können Wunder für die Verdauung bewirken!
              Ballaststoffe unterstützen den Magen-Darm-Trakt, besonders wenn
              beim Putzen vermehrt Haare verschluckt werden. Hier sind Lilly’s
              herbstliche Favoriten:
            </Text>

            <div style={veggieCard}>
              <Text style={veggieTitle}>
                1. Der Hokkaido-Kürbis – Ballaststoff-Wunder
              </Text>
              <Text style={{...paragraph, fontSize: "14px", margin: 0}}>
                Reich an Vitamin A und sanft zum Magen. Ideal bei leichten
                Verdauungsproblemen.
                <strong> Zubereitung:</strong> Unbedingt weich kochen (ohne
                Gewürze!) und fein pürieren, dann unter das gewohnte Nassfutter
                mischen.
              </Text>
            </div>

            <div style={veggieCard}>
              <Text style={veggieTitle}>2. Karotten – Immun-Booster</Text>
              <Text style={{...paragraph, fontSize: "14px", margin: 0}}>
                Liefern wertvolles Beta-Carotin und unterstützen die Sehkraft
                sowie das Immunsystem.
                <strong> Zubereitung:</strong> Gekocht und püriert sind sie
                hochverdaulich. Roh kann die Katze die Nährstoffe kaum
                aufspalten.
              </Text>
            </div>

            <div style={veggieCard}>
              <Text style={veggieTitle}>
                3. Pastinaken – Die sanfte Alternative
              </Text>
              <Text style={{...paragraph, fontSize: "14px", margin: 0}}>
                Besonders mild, leicht süßlich im Geschmack und extrem
                magenschonend. Gut geeignet für sensible Katzenbäuche im
                herbstlichen Fellwechsel.
              </Text>
            </div>

            <Hr style={{borderColor: "#e2e8f0", margin: "30px 0"}} />

            <Heading style={sectionHeading}>
              🩺 Katzengesundheit im Fokus
            </Heading>
            <Text style={paragraph}>
              Feuchtes Wetter und sinkende Temperaturen belasten die Gelenke –
              vor allem bei älteren Freigängern. Achte jetzt darauf, dass deine
              Katze nach ihren Ausflügen einen warmen, zugluftfreien Rückzugsort
              vorfindet. Ein starkes Immunsystem fängt zudem im Napf an:
              Hochwertige Proteine und essentielle Omega-3-Fettsäuren halten das
              Fell glänzend und die Haut gesund.
            </Text>

            <Img
              src="http://localhost:3000/images/gesundheitspromo.jpg"
              width="100%"
              alt="Katze beim Tierarzt-Checkup"
              style={{margin: "16px 0"}}
            />

            <div style={shelterBox}>
              <Heading
                style={{
                  ...sectionHeading,
                  color: "#d97706",
                  marginTop: "0",
                  fontSize: "20px",
                }}
              >
                🐾 Lilly ruft zur Gesundheitsvorsorge auf!
              </Heading>
              <Text style={paragraph}>
                Wir bei <strong>Blue Lilly</strong> glauben, dass ein Newsletter
                mehr als nur Werbung sein sollte. Er ist eine Plattform, um
                gemeinsam Gutes zu tun und die Gesundheit unserer Tiere zu
                organisieren.
              </Text>
              <Text style={paragraph}>
                Deshalb freuen wir uns riesig über unsere neue Kooperation mit
                dem <strong>Tierheim Pfotenlicht e.V.</strong> in Berlin! Das
                Tierheim bietet wichtige Untersuchungen auf Spendenbasis an.
              </Text>
              <Text style={{...paragraph, fontWeight: "600", color: "#1e293b"}}>
                🎁 Die Blue Lilly Aktion: Jedes Community-Mitglied kann seine
                Katze dort für eine kostenlose, grundlegende
                Vorsorgeuntersuchung anmelden. Die Kosten dafür übernimmt Blue
                Lilly im Rahmen unserer Partnerschaft!
              </Text>

              <Text
                style={{
                  ...paragraph,
                  fontSize: "13px",
                  color: "#6b7280",
                  fontStyle: "italic",
                  marginBottom: "8px",
                }}
              >
                <strong>Partner-Tierheim:</strong>
                <br />
                Tierheim Pfotenlicht e.V.
                <br />
                Schnurrhaargasse 12a, 10115 Berlin-Mitte
              </Text>

              <Button
                href="https://www.tierheim-pfotenlicht-fakeadresse.de/blue-lilly-checkup"
                style={button}
              >
                Jetzt kostenlosen Checkup buchen
              </Button>
            </div>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              &copy; 2026 Blue Lilly Catshop. Alle Rechte vorbehalten.
            </Text>
            <Text style={footerText}>
              Du erhältst diesen Newsletter, weil du dich auf
              blue-lilly-catshop.de angemeldet hast.
            </Text>
            <Text style={footerText}>
              <Link
                href="{{{RESEND_UNSUBSCRIBE_URL}}}"
                style={{color: "#e28743", textDecoration: "underline"}}
              >
                Newsletter abbestellen
              </Link>
              {" | "}
              <Link
                href="http://localhost:3000/impressum"
                style={{color: "#e28743", textDecoration: "underline"}}
              >
                Impressum
              </Link>
            </Text>
          </Section>
        </div>
      </Body>
    </Html>
  );
}
