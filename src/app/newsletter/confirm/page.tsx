import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {confirmSubscriberByToken} from "@/lib/newsletter/service";
import {CheckCircle} from "lucide-react";
import Link from "next/link";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import {getSessionOnce} from "@/lib/session/sessionCache";
import {headers} from "next/headers";

type Props = {searchParams: Promise<{token?: string}>};

export default async function ConfirmPage({searchParams}: Props) {
  const params = await searchParams;
  const token = params?.token;
  if (!token) {
    return <div className="p-8">Token fehlt.</div>;
  }

  // 33855e2d779dae22c639de5cb841665bf24898f0e1bd0eb4880293fd3b24826c
  const result = await confirmSubscriberByToken(token);
  const session = await getSessionOnce({headers: await headers()});
  const username = session?.user?.name ?? null;
  // Determine friendly UI texts and CTAs based on backend message
  const msg = String(result.message || "").toLowerCase();

  let title = "Newsletter Anmeldung fehlgeschlagen";
  let subtitle = "Leider ist ein Fehler aufgetreten.";

  if (result.success) {
    title = "Newsletter Anmeldung erfolgreich!";
    subtitle = "Vielen Dank für Ihre Anmeldung.";
  } else if (msg.includes("bereits") || msg.includes("verwendet")) {
    title = "Bereits bestätigt";
    subtitle = "Der Link wurde bereits verwendet. Sie sind bereits angemeldet.";
  } else if (msg.includes("abgelaufen")) {
    title = "Bestätigungslink abgelaufen";
    subtitle = "Der Link ist abgelaufen.";
  } else if (msg.includes("ungültig")) {
    title = "Ungültiger Bestätigungslink";
    subtitle = "Der Link ist ungültig.";
  }

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

        {/* Show newsletter signup form when token expired to let user re-subscribe */}
        {!result.success && msg.includes("abgelaufen") ? (
          <div className="w-full flex flex-col items-center justify-center py-6">
            <NewsletterForm
              title={
                username
                  ? `Melde dich gerne erneut an, ${username}.!`
                  : "Melde dich gerne erneut an."
              }
            />
          </div>
        ) : null}
      </Card>
    </main>
  );
}
