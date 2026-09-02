"use client";
import {useState} from "react";
import CreateCampaignForm from "@/app/dashboard/admin/newsletter/CreateCampaignForm";

export default function NewsletterAdmin() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [simEmail, setSimEmail] = useState("");
  const [simEvent, setSimEvent] = useState("email.bounced");

  async function sendTest(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Senden...");
    try {
      const res = await fetch("/api/newsletter/send-test", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email}),
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (_) {
        json = null;
      }
      if (res.ok) setStatus("Testmail gesendet.");
      else setStatus(json?.message || text || "Fehler beim Senden");
    } catch (err) {
      setStatus(String(err));
    }
  }

  async function sendWeek1(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sende Newsletter week1...");
    try {
      const res = await fetch("/api/newsletter/send-week1", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email}),
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (_) {
        json = null;
      }
      if (res.ok) setStatus("Newsletter week1 gesendet.");
      else setStatus(json?.message || text || "Fehler beim Senden");
    } catch (err) {
      setStatus(String(err));
    }
  }

  async function sendAll(e: React.MouseEvent) {
    if (
      !confirm(
        "Newsletter an alle Abonnenten senden? Dies ist ein TEST. Fortfahren?",
      )
    )
      return;
    setStatus("Sende an alle Abonnenten...");
    try {
      const res = await fetch("/api/newsletter/send-all", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({template: "week1"}),
      });
      const text = await res.text();
      type SendAllResponse = {sent?: number; message?: string};
      let json: SendAllResponse | null = null;
      try {
        json = text ? (JSON.parse(text) as SendAllResponse) : null;
      } catch (e) {
        console.error("[send-all] error parsing response", e);
        json = null;
      }
      if (res.ok) setStatus(`Fertig: ${json?.sent ?? "?"} gesendet.`);
      else setStatus(json?.message || text || "Fehler beim Massenversand");
    } catch (err) {
      setStatus(String(err));
    }
  }

  async function sendBroadcast(e: React.MouseEvent) {
    if (!confirm("Broadcast an Segment senden? Fortfahren?")) return;
    setStatus("Sende Broadcast...");
    try {
      const res = await fetch("/api/newsletter/send-broadcast", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({template: "week1"}),
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (_) {
        json = null;
      }
      if (res.ok) setStatus(`Broadcast gesendet: ${json?.broadcastId || text}`);
      else setStatus(json?.message || text || "Fehler beim Broadcast");
    } catch (err) {
      setStatus(String(err));
    }
  }

  async function simulateWebhook(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Simuliere Webhook...");
    try {
      const res = await fetch("/api/webhooks/resend/simulate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({eventType: simEvent, email: simEmail}),
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (_) {
        json = null;
      }
      if (res.ok) setStatus("Simulation ausgeführt.");
      else setStatus(json?.message || text || "Fehler bei Simulation");
    } catch (err) {
      setStatus(String(err));
    }
  }

  return (
    <div className="space-y-6">
      <section className="p-4 border rounded">
        <h3 className="font-semibold mb-2">Newsletter Testversand</h3>
        <form onSubmit={sendTest} className="flex gap-2">
          <input
            className="border px-3 py-2 rounded flex-1"
            placeholder="Empfänger Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-primary px-4 py-2 rounded" type="submit">
            Senden
          </button>
        </form>
        <div className="mt-3">
          <form onSubmit={sendWeek1} className="flex gap-2">
            <input
              className="border px-3 py-2 rounded flex-1"
              placeholder="Empfänger für Week1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn-accent px-4 py-2 rounded" type="submit">
              Newsletter (week1) senden
            </button>
          </form>
        </div>
      </section>
      <section className="p-4 border rounded">
        <h3 className="font-semibold mb-2">Erstelle Newsletter (Admin)</h3>
        <div className="text-sm text-muted-foreground mb-2">
          Erstelle eine neue Draft‑Kampagne. Die Route prüft Admin‑Rechte
          serverseitig.
        </div>
        <CreateCampaignForm />
      </section>
      <section className="p-4 border rounded">
        <h3 className="font-semibold mb-2">Vorschau Newsletter (Week1)</h3>
        <div className="mb-2 text-sm text-muted-foreground">
          Vorschau des Newsletters. Nutze die Vorschau, um Inhalt zu prüfen.
        </div>
        <div className="w-full h-[600px] border">
          <iframe
            title="Newsletter Preview"
            src="/newsletter/september06/week1"
            className="w-full h-full"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={sendBroadcast}
            className="btn-accent px-4 py-2 rounded"
          >
            Broadcast an Segment senden
          </button>
        </div>
      </section>
      <section className="p-4 border rounded">
        <h3 className="font-semibold mb-2">Send to all (Test)</h3>
        <p className="text-sm mb-2">
          Versendet die `week1`‑Vorlage an alle bestätigten Abonnenten. Nur für
          Tests.
        </p>
        <div className="flex gap-2">
          <button
            onClick={sendAll}
            className="btn-destructive px-4 py-2 rounded"
          >
            Send to all subscribers
          </button>
        </div>
      </section>

      <section className="p-4 border rounded">
        <h3 className="font-semibold mb-2">Webhook Simulation (Dev only)</h3>
        <form onSubmit={simulateWebhook} className="flex gap-2 items-center">
          <select
            value={simEvent}
            onChange={(e) => setSimEvent(e.target.value)}
            className="border px-2 py-2 rounded"
          >
            <option value="email.bounced">email.bounced</option>
            <option value="email.complained">email.complained</option>
            <option value="email.delivered">email.delivered</option>
          </select>
          <input
            className="border px-3 py-2 rounded"
            placeholder="Betroffene Email"
            value={simEmail}
            onChange={(e) => setSimEmail(e.target.value)}
          />
          <button className="btn-secondary px-4 py-2 rounded" type="submit">
            Simulieren
          </button>
        </form>
        <p className="text-sm text-muted-foreground mt-2">
          Hinweis: Diese Simulation läuft nur in Development/Non‑Production.
        </p>
      </section>

      {status && <div className="p-3 bg-gray-50 rounded text-sm">{status}</div>}
    </div>
  );
}
