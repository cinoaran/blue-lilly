"use client";
import {MessageSquareMore, MoveLeft, TimerReset} from "lucide-react";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import Link from "next/link";
import PasswordForm from "../_components/reset/PasswordForm";

const ResetPasswordPage = () => {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {
            label: "Passwort zurücksetzen",
            href: "/reset-password",
            active: true,
          },
        ]}
      />
      <div className="w-[90%] md:w-3/4 bg-background text-foreground px-5 border-[0.3px] border-foreground/10 rounded-lg backdrop-blur-md shadow-md shadow-foreground/10 mx-auto font-roboto font-thin my-10">
        <div className="flex items-center justify-center flex-col border-b-2 border-foreground/5 md:px-5 pb-10">
          <h3 className="flex items-center justify-center text-center uppercase py-10 gap-4 font-semibold">
            <TimerReset size={36} className="text-primary" /> Setzen Sie Ihr
            Passwort zurück.
          </h3>
          <ul className="flex flex-col items-center md:flex-row gap-10">
            <li className="flex flex-col md:flex-row items-center justify-center text-center gap-3 uppercase">
              <MessageSquareMore size={18} className="text-primary" />
              Bitte geben Sie Ihr neues Passwort ein und bestätigen Sie es!!
            </li>
          </ul>
        </div>
        <div className="flex items-center justify-center my-10 px-2">
          <PasswordForm />
        </div>

        <div className="flex items-center gap-2 text-foreground py-5 px-10">
          <Link
            href="/login"
            className="text-sm h-6 text-bold text-foreground underlined"
          >
            <p className="flex items-center justify-center text-bold gap-2 font-thin">
              <MoveLeft className="h-5 w-5 animate-pulse" />
              <span>Zurück zum Login!</span>
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
