"use client";
import React, {useEffect, useState} from "react";
import {isDisposableEmail} from "@/lib/disposable-email-check";
import {Input} from "../ui/input";
import {Gift} from "lucide-react";
import {Button} from "../ui/button";
import Link from "next/link";
import SuccessToast from "@/components/shared/customToast/SuccessToast";
import ErrorToast from "@/components/shared/customToast/ErrorToast";

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
    <div className="relative flex flex-col items-center justify-center gap-12 bg-card/40 rounded-lg border-[0.3px] border-foreground/10 h-96 md:h-72 w-full overflow-hidden p-4">
      <Gift className="absolute -bottom-6 -right-6 md:-bottom-12 md:-right-12 text-primary size-24 md:size-42" />

      {title === null ? null : (
        <span className="font-normal text-left text-md md:text-lg">
          {typeof title === "string"
            ? title
            : "Melde dich für unseren Newsletter an! Profitiere von exklusiven Angeboten, Neuigkeiten und spannenden Inhalten direkt in deinem Posteingang."}
        </span>
      )}

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
            className="flex-1 p-6 rounded"
            required
          />
          <Button
            type="submit"
            disabled={loading || !!emailError || !consent}
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
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
            Ich möchte den Newsletter erhalten und stimme der
            <Link
              href="/datenschutzerklarung"
              className="text-primary underlined px-1"
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
  );
}
