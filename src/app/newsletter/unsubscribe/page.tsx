import {Card, CardHeader} from "@/components/ui/card";
import {unsubscribeByToken} from "@/lib/newsletter/service";

type Props = {searchParams: Promise<{token?: string}>};

export default async function UnsubscribePage({searchParams}: Props) {
  const params = await searchParams;
  const token = params?.token;
  if (!token) {
    return <div className="p-8">Token fehlt.</div>;
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
