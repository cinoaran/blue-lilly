"use client";
import React, {useEffect, useState} from "react";
import {isDisposableEmail} from "@/lib/disposable-email-check";
import {Input} from "../ui/input";
import {Gift} from "lucide-react";
import {Button} from "../ui/button";
import Link from "next/link";
import SuccessToast from "@/components/shared/customToast/SuccessToast";
import ErrorToast from "@/components/shared/customToast/ErrorToast";
import Image from "next/image";

type Props = {
  onSuccess?: () => void;
  title?: string | null; // if null => hide title; if undefined => show default
};

export default function NewsletterForm({onSuccess, title}: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    // ensure basic checks
    if (!email || !consent) {
      setMessage("Bitte E-Mail eingeben und Einwilligung akzeptieren.");
      return;
    }

    // if client-side validation flagged an error, show unified message
    if (emailError) {
      setMessage("Email Validierung fehlgeschlagen");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("consent", consent ? "on" : "off");
      const res = await fetch("/api/resend/subscribe", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json?.success) {
        setMessage(json.message || "Bitte prüfe dein Postfach.");
        setEmail("");
        setConsent(false);
        onSuccess?.();
      } else {
        const serverMsg = String(json?.message ?? "");
        if (
          serverMsg.includes("Ungültige E-Mail") ||
          serverMsg.includes("Temporäre E‑Mail") ||
          serverMsg.includes("Anfragen von deiner IP") ||
          serverMsg.includes("Eingaben prüfen")
        ) {
          setMessage("Email Validierung fehlgeschlagen");
        } else {
          setMessage(serverMsg || "Fehler bei der Anmeldung.");
        }
      }
    } catch (err) {
      console.error("Error in newsletter form submission:", err);
      setMessage("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!email) {
      setEmailError(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Ungültiges Format");
      return;
    }
    if (isDisposableEmail(email)) {
      setEmailError("Disposable E-Mail nicht erlaubt");
      return;
    }
    setEmailError(null);
  }, [email]);

  return (
    <div className="relative flex flex-col md:flex-row items-center justify-center gap-5 bg-card/40 rounded-lg border-[0.3px] border-foreground/10 h-auto overflow-hidden w-full p-4">
      <Gift className="absolute top-2 -left-32 text-background size-72 z-0" />
      <div className="flex-1 flex items-center justify-center mb-4 z-10">
        <Link href="/product/skin-cout-oel?size=70&optionId=052423a9-5946-42e1-969e-adcc0e0fe060">
          <Image
            src="/shop/Vitality/Haut-Haare-Schutz/skin-coat-oil-100ml.png"
            alt="Newsletter"
            width={300}
            height={200}
            className="hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>
      <div className="flex-3">
        <h3 className="font-bold text-lg md:text-4xl mb-12 text-center">
          Heute wollen wir Ihnen eine Freude machen!
        </h3>
        {title === null ? null : (
          <div className="font-normal text-left text-md md:text-xl">
            {typeof title === "string" ? (
              <span className="font-normal text-left text-md md:text-xl">
                {title}
              </span>
            ) : (
              <span className="font-normal text-left text-md md:text-xl">
                Melden Sie sich jetzt zu unserem Newsletter an und wir legen das
                hochwertige Blue Lilly&apos;s Best™ Skin & Coat Oil (100 ml) als
                reines Gratis-Geschenk zu Ihrer nächsten Buchung dazu.
              </span>
            )}
          </div>
        )}

        <hr className="w-full border-foreground/10 my-4" />

        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xs w-full md:max-w-3/4"
        >
          <div className="flex items-start justify-start gap-6">
            <Input
              aria-label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Deine E-Mail"
              className="w-full border-b-[0.3px] border-border focus-visible:underlined py-6 text-[0.6rem] md:text-lg"
              required
            />
            <Button
              type="submit"
              disabled={loading || !!emailError || !consent}
              className="px-4 py-6 bg-primary text-white rounded disabled:opacity-50"
            >
              {loading ? "..." : "Anmelden"}
            </Button>
          </div>
          <label className="flex items-center gap-4 mt-8 text-sm">
            <input
              type="checkbox"
              className="w-4 h-4 bg-primary cursor-pointer"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            <span className="text-foreground">
              Jetzt Anmelden und
              <Link
                href="/datenschutz"
                className="text-destructive underlined px-1"
              >
                Datenschutzerklärung
              </Link>
              zu.
            </span>
          </label>
          <div className="my-2 flex flex-col justify-center">
            {emailError ? (
              <ErrorToast
                message={emailError}
                duration={4000}
                onClose={() => setEmailError(null)}
              />
            ) : null}
          </div>
          {message && (
            <SuccessToast
              message={message}
              duration={4000}
              onClose={() => setMessage(null)}
            />
          )}
        </form>
      </div>
    </div>
  );
}
