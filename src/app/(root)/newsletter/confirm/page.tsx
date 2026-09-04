import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {confirmSubscriberByToken} from "@/lib/newsletter/service";
import {CheckCircle} from "lucide-react";
import Link from "next/link";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import {getSessionOnce} from "@/lib/session/sessionCache";
import {headers} from "next/headers";
import prisma from "@/lib/prisma";
import crypto from "node:crypto";

type Props = {searchParams: Promise<{token?: string}>};

export default async function ConfirmPage({searchParams}: Props) {
  const params = await searchParams;
  const token = params?.token;
  if (!token) {
    return <div className="p-8">Token fehlt.</div>;
  }
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Try to read subscriber by confirmation token first
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: {
      confirmationTokenHash: tokenHash,
    },
  });

  console.log(subscriber);

  const session = await getSessionOnce({headers: await headers()});
  const username = session?.user?.name ?? null;
  // Use DB state to decide what to show (avoid text-based checks / localization issues)
  const now = new Date();

  if (!subscriber) {
    // Token not found - show invalid/used message
    const title = "Ungültiger Bestätigungslink";
    const subtitle =
      "Der Bestätigungslink ist ungültig oder wurde bereits verwendet.";

    return (
      <main className="container mx-auto p-8">
        <Card className="border-none text-foreground my-20 py-5 w-full max-w-5xl mx-auto">
          <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
            <div className="flex flex-col items-center justify-center gap-4">
              <h3 className="text-center font-semibold text-xl">{title}</h3>
              <p className="text-center text-sm opacity-90">{subtitle}</p>
            </div>
          </CardHeader>

          <div className="flex flex-col items-center justify-center p-6">
            <NewsletterForm
              title={
                username
                  ? `Melde dich gerne erneut an, ${username}.!`
                  : "Melde dich gerne erneut an."
              }
            />
          </div>
        </Card>
      </main>
    );
  }

  if (subscriber.status === "UNSUBSCRIBED") {
    return (
      <main className="container mx-auto p-8">
        <Card className="border-none text-foreground my-20 py-12 w-full max-w-5xl mx-auto">
          <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
            <div className="flex flex-col items-center justify-center gap-4">
              <h3 className="text-center font-semibold text-xl">
                Sie sind abgemeldet
              </h3>
              <p className="text-center text-sm opacity-90">
                Diese E-Mail-Adresse ist abgemeldet.
              </p>
            </div>
          </CardHeader>

          {subscriber.unsubscribeTokenHash === null ? (
            <div className="w-full flex flex-col items-center justify-center px-4 py-6">
              <NewsletterForm
                title={
                  username
                    ? `Hier können Sie sich erneut anmelden, ${username}.!`
                    : "Hier können Sie sich erneut anmelden,"
                }
              />
            </div>
          ) : null}
        </Card>
      </main>
    );
  }

  if (subscriber.status === "SUBSCRIBED") {
    const title = "Bereits bestätigt";
    const subtitle = "Diese Newsletter-Anmeldung wurde bereits bestätigt.";

    return (
      <main className="container mx-auto p-8">
        <Card className="border-none text-foreground my-20 py-12 w-full max-w-5xl mx-auto">
          <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
            <div className="flex flex-col items-center justify-center gap-4">
              <h3 className="text-center font-semibold text-xl">{title}</h3>
              <p className="text-center text-sm opacity-90">{subtitle}</p>
            </div>
          </CardHeader>
        </Card>
      </main>
    );
  }

  // Pending - check expiry
  if (
    subscriber.confirmationExpiresAt &&
    subscriber.confirmationExpiresAt <= now
  ) {
    const title = "Bestätigungslink abgelaufen";
    const subtitle = "Der Bestätigungslink ist abgelaufen.";

    return (
      <main className="container mx-auto p-8 h-72 max-w-7xl">
        <Card className="border-none text-foreground my-20 p-5 w-full">
          <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
            <div className="flex flex-col items-center justify-center gap-4">
              <h3 className="text-center font-semibold text-xl">{title}</h3>
              <p className="text-center text-sm opacity-90">{subtitle}</p>
            </div>
          </CardHeader>

          <div className="w-full flex flex-col items-center justify-center">
            <NewsletterForm
              title={
                username
                  ? `Melde dich gerne erneut an, ${username}.!`
                  : "Melde dich gerne erneut an."
              }
            />
          </div>
        </Card>
      </main>
    );
  }

  // Otherwise: proceed with confirmation (subscriber is likely PENDING and not expired)
  const result = await confirmSubscriberByToken(token);

  // derive title/subtitle from structured result
  const title = result.success
    ? "Newsletter Anmeldung erfolgreich!"
    : "Newsletter Anmeldung fehlgeschlagen";

  const subtitle = result.success
    ? "Vielen Dank für Ihre Anmeldung."
    : (result.message as string) || "Leider ist ein Fehler aufgetreten.";

  return (
    <main className="container mx-auto p-8">
      <Card className="border-none text-foreground my-20 py-12 w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
          <div className="flex flex-col items-center justify-center gap-4">
            <h3 className="text-center font-semibold text-xl">{title}</h3>
            <p className="text-center text-sm opacity-90">{subtitle}</p>
            <span className="flex items-center justify-center gap-3 text-primary mt-4">
              <p className="text-center">{result.message}</p>
              <CheckCircle size={30} className="text-primary" />
            </span>
          </div>
        </CardHeader>

        {result.success ? (
          <CardContent className="mx-auto flex flex-col items-center justify-center gap-6">
            <div className="w-full space-y-3 p-4 border border-blue-200 rounded-md text-foreground text-center">
              <p className="text-md">
                Ihre Anmeldung ist nun abgeschlossen. Sie werden ab sofort
                regelmäßig unseren Newsletter mit exklusiven Angeboten,
                Neuigkeiten und spannenden Inhalten direkt in Ihrem Posteingang
                erhalten.
              </p>
              <p className="md:text-md">
                <strong>Gut zu wissen:</strong> Sie können sich jederzeit wieder
                vom Newsletter abmelden, indem Sie den Abmeldelink in unseren
                E-Mails nutzen.
              </p>
            </div>
          </CardContent>
        ) : null}

        <div className="mx-auto flex flex-col items-center justify-center gap-4 mt-6">
          <Link
            href="/"
            className="flex items-center justify-center gap-3 w-fit underlined cursor-pointer uppercase"
          >
            Zurück zum Shop
          </Link>
        </div>
      </Card>
    </main>
  );
}
