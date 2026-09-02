import Registerform from "../_components/RegisterForm";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import {
  UserCheck,
  TvMinimal,
  UserPen,
  MonitorCheckIcon,
  MailCheckIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const RegisterPage = () => {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Registrierung", href: "/register", active: true},
        ]}
      />
      <div className="w-[90vw] sm:w-3/4 bg-background text-foreground border-[0.3px] border-foreground/10 rounded-lg backdrop-blur-md shadow-md shadow-foreground/10 mx-auto my-12">
        <div className="flex items-center justify-center flex-col border-b-2 border-foreground/5 md:px-5 py-12">
          <div className="flex items-center justify-center flex-col gap-10">
            <h2 className="flex items-center justify-center text-center uppercase font-semibold gap-4">
              <span>
                <MonitorCheckIcon size={36} className="text-primary" />
              </span>
              Registrierung.
            </h2>
            <ul className="flex flex-col items-center xl:flex-row gap-8">
              <li className="flex flex-row items-center justify-center text-center gap-3 uppercase">
                <UserCheck size={18} className="text-primary" />
                Zugriff auf Ihre Daten.
              </li>
              <li className="flex flex-row items-center justify-center text-center gap-3 uppercase">
                <TvMinimal size={18} className="text-primary" />
                Auflistung Ihrer Historie.
              </li>
              <li className="flex flex-row items-center justify-center text-center gap-3 uppercase">
                <MailCheckIcon size={18} className="text-primary" />
                Mit E-Mail-Verifizierung.
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-5 mx-auto my-10">
          <div className="flex items-center justify-center w-full h-full md:flex-2 px-2">
            <Registerform />
          </div>
        </div>
        <div className="flex items-center flex-col md:flex-row justify-between gap-2 py-5 px-10">
          <div className="flex items-center gap-2 h-8 underlined text-foreground">
            <Link href="/login" className="text-sm text-bold text-foreground">
              <p className="flex items-center justify-center text-bold gap-2 font-thin">
                <span>Sie haben bereits ein Konto? Jetzt einloggen</span>
                <UserPen className="h-5 w-5 animate-pulse" />
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
