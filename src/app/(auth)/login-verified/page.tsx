import {Card, CardContent, CardHeader} from "@/components/ui/card";
import Link from "next/link";
import {HomeIcon, ShoppingCart, CheckCircle} from "lucide-react";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";

export default async function LoginVerified() {
  const session = await auth.api.getSession({headers: await headers()});
  const name = session?.user?.name ?? "Gast";

  return (
    <Card className="border-none text-foreground my-20 py-12 w-full max-w-5xl mx-auto">
      <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
        <div className="flex flex-col items-center justify-center gap-4">
          <h3 className="flex items-center justify-center text-center uppercase font-semibold gap-5">
            Hallo {name}! Schön, dass du da bist.
          </h3>
          <span className="flex items-center justify-center gap-3 text-primary">
            <CheckCircle size={30} className="text-primary" />
          </span>
        </div>
      </CardHeader>

      <CardContent className="mx-auto flex flex-col items-center justify-center gap-6">
        <div className="w-full space-y-3 p-4 border border-blue-200 rounded-md text-foreground text-center">
          <p className="text-md">
            Deine Artikel sind sicher mit deinem Kundenkonto verknüpft.
            <br />
            Du findest deinen aktuellen Warenkorb und alle bisherigen
            Bestellungen ab sofort jederzeit in deinem Dashboard.
          </p>
          <p className="md:text-md">
            <strong>Gut zu wissen:</strong> Wenn du dich ausloggst, wird dein
            Warenkorb zum Schutz deiner Daten geleert. <br />
            Sobald du dich wieder anmeldest, wartet dein Einkauf genau hier auf
            dich.
          </p>
        </div>

        <ul className="flex flex-col items-start lg:items-center lg:flex-row gap-5 lg:gap-30">
          <li className="flex flex-row items-center justify-center text-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 w-fit underlined cursor-pointer uppercase"
            >
              <ShoppingCart size={16} className="text-primary" /> Zurück zum
              Shop
            </Link>
          </li>
          <li className="flex flex-row items-center justify-center text-center">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-3 w-fit underlined uppercase"
            >
              <HomeIcon size={16} className="text-primary" /> Weiter zum
              Dashboard
            </Link>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
