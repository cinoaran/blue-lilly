import Link from "next/link";
import {confirmSubscriberByToken} from "@/lib/resend/service";
import CartLayout from "@/app/(root)/cart/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {HomeIcon, Monitor} from "lucide-react";

type Props = {
  searchParams?: Promise<{token?: string | string[] | undefined}>;
};

export default async function Page({searchParams}: Props) {
  const rawToken = (await searchParams)?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  const result = token ? await confirmSubscriberByToken(token) : null;
  const success = result?.success === true;

  return (
    <CartLayout>
      <main className="container mx-auto p-8">
        <Card className="border-none text-foreground my-20 py-12 w-full max-w-5xl mx-auto">
          <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
            <div>
              <h3 className="flex items-center text-xl justify-center text-center uppercase font-semibold gap-5">
                <span>
                  <Monitor size={30} className="text-primary" />
                </span>
                {success
                  ? "Newsletter-Anmeldung wurde verifiziert!"
                  : "Newsletter-Bestätigung fehlgeschlagen"}
              </h3>
            </div>
            <CardDescription className="text-center text-sm text-foreground/80 my-8">
              {success
                ? "Was möchten Sie als Nächstes tun?"
                : (result?.message ?? "Kein Bestätigungstoken angegeben.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="mx-auto flex items-center justify-center">
            <ul className="flex flex-col items-start lg:items-center lg:flex-row gap-5 lg:gap-30">
              <li className="flex flex-row items-center justify-center text-center">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-3 w-fit underlined uppercase"
                >
                  <HomeIcon size={16} className="text-primary" /> Zur Startseite
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </CartLayout>
  );
}
