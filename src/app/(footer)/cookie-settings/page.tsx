"use client";

import {Card} from "@/components/ui/card";
import {useState} from "react";

export default function CookieSettingsPage() {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <Card className="w-[85vw] md:w-fit mx-auto my-16 p-12">
      <h2 className="font-bold mb-6">Cookie‑Einstellungen</h2>
      <p className="mb-6">
        Hier kannst du deine Zustimmung zu verschiedenen Cookie‑Kategorien
        verwalten.
      </p>
      <form className="space-y-6">
        <label className="flex items-center justify-between">
          <span>Essenzielle Cookies (erforderlich)</span>
          <input type="checkbox" checked readOnly />
        </label>
        <label className="flex items-center justify-between">
          <span>Analytics</span>
          <input
            type="checkbox"
            checked={analytics}
            onChange={() => setAnalytics(!analytics)}
          />
        </label>
        <label className="flex items-center justify-between">
          <span>Marketing</span>
          <input
            type="checkbox"
            checked={marketing}
            onChange={() => setMarketing(!marketing)}
          />
        </label>
        <div>
          <button
            type="button"
            className="rounded bg-primary text-white px-4 py-2"
            onClick={() => alert("Einstellungen gespeichert (Platzhalter)")}
          >
            Einstellungen speichern
          </button>
        </div>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Hinweis: Dies ist ein Beispiel‑UI. Implementiere serverseitige
        Speicherung oder Cookie‑Header‑Logik, um die Auswahl tatsächlich zu
        aktivieren.
      </p>
    </Card>
  );
}
