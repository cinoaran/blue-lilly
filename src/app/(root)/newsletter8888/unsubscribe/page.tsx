import {Card, CardHeader} from "@/components/ui/card";
import {unsubscribeByToken} from "@/lib/resend-newsletter/service";
import NewsletterForm from "@/components/resend-newsletter/NewsletterForm";
import prisma from "@/lib/prisma";
import crypto from "node:crypto";
import {getSessionOnce} from "@/lib/session/sessionCache";
import {headers} from "next/headers";

type Props = {searchParams: Promise<{token?: string}>};

export default async function UnsubscribePage({searchParams}: Props) {
  const params = await searchParams;
  const token = params?.token;
  if (!token) {
    return <div className="p-8">Token fehlt.</div>;
  }
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Try to resolve the subscriber by the token hash first
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: {
      unsubscribeTokenHash: tokenHash,
    },
  });

  const session = await getSessionOnce({headers: await headers()});
  const username = session?.user?.name ?? null;

  // If we found a subscriber and they are already unsubscribed, show a friendly message
  if (subscriber && subscriber.status === "UNSUBSCRIBED") {
    return (
      <main className="container mx-auto max-w-5xl">
        <Card className="border-none text-foreground my-20 py-12 w-full">
          <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
            <div className="flex flex-col items-center justify-center gap-4">
              <h3 className="flex items-center justify-center text-center uppercase font-semibold gap-5">
                Sie sind bereits abgemeldet
              </h3>
              <span className="flex items-center justify-center gap-3 text-primary">
                <p>
                  Deine E-Mail-Adresse wurde bereits vom Newsletter entfernt.
                </p>
              </span>
            </div>
          </CardHeader>

          {subscriber.unsubscribeTokenHash === null ? (
            <div className="w-full flex flex-col items-center justify-center py-6">
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

  const result = await unsubscribeByToken(token);
  return (
    <main className="container mx-auto p-8">
      <Card className="border-none text-foreground my-20 py-12 w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
          <div className="flex flex-col items-center justify-center gap-4">
            <h3 className="flex items-center justify-center text-center uppercase font-semibold gap-5">
              {result.success
                ? "Newsletter Abmeldung erfolgreich!"
                : "Newsletter Abmeldung fehlgeschlagen!"}
            </h3>
            <span className="flex items-center justify-center gap-3 text-primary">
              <p>{result.message}</p>
            </span>
          </div>
        </CardHeader>
      </Card>
    </main>
  );
}
