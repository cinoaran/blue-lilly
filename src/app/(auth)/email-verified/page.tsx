import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";
import {HomeIcon, LayoutDashboard, MonitorCheck} from "lucide-react";

const EmailVerified = () => {
  return (
    <main className="container mx-auto p-8">
      <Card className="border-none text-foreground my-20 py-12 w-full max-w-5xl mx-auto">
        <CardHeader className="flex flex-col items-center justify-center gap-6 font-bold uppercase">
          <div>
            <h3 className="flex items-center justify-center text-center uppercase font-semibold gap-5">
              <span>
                <MonitorCheck size={30} className="text-primary" />
              </span>
              Emailadresse wurde verifiziert!
            </h3>
          </div>
          <CardDescription className="text-center text-sm text-foreground/80 my-8">
            Was möchten Sie als Nächstes tun?
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
            <li className="flex flex-row items-center justify-center text-center">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-3 w-fit underlined cursor-pointer uppercase"
              >
                <LayoutDashboard size={16} className="text-primary" /> Zur
                Dashboardseite
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
};

export default EmailVerified;
