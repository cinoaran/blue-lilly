"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import React, {useState} from "react";

type Props = {
  onCreated?: (campaign: {
    id: string;
    name: string;
    subject: string;
    status: string;
    resendBroadcastId?: string | null;
    html?: string | null;
    text?: string | null;
    errorMessage?: string | null;
    createdAt: string;
  }) => void;
};

export default function CreateCampaignForm({onCreated}: Props) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState(`<div>
  <h1>Willkommen zum Newsletter</h1>
  <p>Dies ist ein Testnewsletter.</p>
  <p><a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Abmelden</a></p>
</div>`);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    campaign?: {
      id: string;
      name: string;
      subject: string;
      status: string;
      resendBroadcastId?: string | null;
      html?: string | null;
      text?: string | null;
      errorMessage?: string | null;
      createdAt: string;
    };
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      if (!html.includes("RESEND_UNSUBSCRIBE_URL")) {
        setResult({
          success: false,
          error:
            "Der Newsletter muss den Platzhalter RESEND_UNSUBSCRIBE_URL enthalten (z.B. {{{RESEND_UNSUBSCRIBE_URL}}}).",
        });
        setLoading(false);
        return;
      }
      const res = await fetch("/api/admin/newsletters", {
        method: "POST",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, subject, html, text}),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        console.error("failed to parse JSON response", e);
        data = {
          success: res.ok,
          error: res.ok ? undefined : `HTTP ${res.status}`,
        };
      }
      setResult(data);
      if (res.ok && data?.campaign) {
        onCreated?.(data.campaign);
        // clear form on success
        setName("");
        setSubject("");
        setHtml(
          '<div>\n  <h1>Willkommen zum Newsletter</h1>\n  <p>Dies ist ein Testnewsletter.</p>\n  <p><a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Abmelden</a></p>\n</div>',
        );
        setText("");
      }
    } catch (err) {
      setResult({success: false, error: (err as Error).message});
    } finally {
      setLoading(false);
    }
  }

  // no-op: form notifies parent only on create via onCreated

  return (
    <div className="w-full max-w-3xl p-6 bg-background/60 rounded">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">HTML</label>
          <Textarea
            placeholder="HTML goes here."
            rows={8}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="mt-1 block w-full font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Text (optional)</label>
          <Textarea
            placeholder="Type your message here."
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Erstelle..." : "Erstelle Draft"}
          </Button>
        </div>

        {result && (
          <div className="mt-4">
            {result.success ? (
              <div className="p-2 bg-green-50 text-green-800 rounded space-y-1">
                <div>
                  Draft erstellt
                  {result.campaign?.id ? `: ${result.campaign.id}` : ""}
                </div>
                {result.campaign?.status ? (
                  <div className="text-xs text-gray-700">
                    Status: {result.campaign.status}
                  </div>
                ) : null}
                {result.campaign?.resendBroadcastId ? (
                  <div className="text-xs text-gray-700">
                    Resend Broadcast ID: {result.campaign.resendBroadcastId}
                  </div>
                ) : null}
                {result.campaign?.errorMessage ? (
                  <div className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs whitespace-pre-wrap">
                    {result.campaign.errorMessage}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-2 bg-red-50 text-red-800 rounded">
                {result.error ?? JSON.stringify(result)}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
