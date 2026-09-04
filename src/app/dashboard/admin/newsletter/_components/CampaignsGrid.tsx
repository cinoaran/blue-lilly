"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import React from "react";

type Campaign = {
  id: string;
  name: string;
  subject: string;
  status: string;
  resendBroadcastId?: string | null;
  errorMessage?: string | null;
  html?: string | null;
  text?: string | null;
  createdAt: string;
};

export default function CampaignsGrid({reloadKey}: {reloadKey: number}) {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState<{
    name?: string;
    subject?: string;
  }>({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletters");
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [reloadKey]);

  async function handleUpdate(id: string) {
    try {
      const res = await fetch(`/api/admin/newsletters/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(editValues),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      setEditingId(null);
      load();
    } catch (e) {
      alert(String(e));
    }
  }

  async function handleSend(id: string) {
    if (
      !confirm("Send campaign? This will mark as SENDING and trigger Resend.")
    )
      return;
    try {
      const res = await fetch(`/api/admin/newsletters/${id}/send`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || JSON.stringify(data));
      alert("Send initiated");
      load();
    } catch (e) {
      alert(String(e));
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Campaigns</h3>
      {/* Debug: show campaign ids + status to investigate disabled Send button */}
      <pre className="text-xs text-gray-500 mb-2">
        {JSON.stringify(
          campaigns.map((c) => ({id: c.id, name: c.name, status: c.status})),
          null,
          2,
        )}
      </pre>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="border rounded-md p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-600 text-md">
                    {c.name}
                  </div>
                  <div className="text-md text-gray-600">{c.subject}</div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full border">
                  {c.status}
                </div>
              </div>

              <div className="mt-3 text-md text-gray-500">
                {new Date(c.createdAt).toLocaleString()}
              </div>

              {c.resendBroadcastId ? (
                <div className="mt-2 text-md text-gray-600">
                  <div className="font-medium">Resend Broadcast ID</div>
                  <div className="break-all">{c.resendBroadcastId}</div>
                </div>
              ) : null}

              {c.errorMessage ? (
                <div className="mt-2 p-2 bg-red-50 text-red-800 rounded text-xs">
                  <div className="font-medium">Fehler</div>
                  <div className="whitespace-pre-wrap">{c.errorMessage}</div>
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-2">
                {editingId === c.id ? (
                  <>
                    <Input
                      className="flex-1 text-black px-2 py-1"
                      value={editValues.name ?? c.name}
                      onChange={(e) =>
                        setEditValues((s) => ({...s, name: e.target.value}))
                      }
                    />
                    <Input
                      className="flex-1 text-black px-2 py-1"
                      value={editValues.subject ?? c.subject}
                      onChange={(e) =>
                        setEditValues((s) => ({...s, subject: e.target.value}))
                      }
                    />
                    <Button
                      className="px-2 py-1 bg-success"
                      onClick={() => handleUpdate(c.id)}
                    >
                      Save
                    </Button>
                    <Button
                      className="px-2 py-1 bg-destructive"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="px-2 py-1 bg-white border rounded text-sm text-black"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditValues({name: c.name, subject: c.subject});
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      className="px-2 py-1 bg-green-200 text-black rounded text-sm"
                      onClick={() => handleSend(c.id)}
                      disabled={c.status !== "DRAFT"}
                    >
                      Send
                    </Button>
                  </>
                )}
              </div>
              {/* Always show preview inside the card */}
              <div
                className="mt-3 p-4 bg-white border rounded text-black prose max-w-none text-base"
                dangerouslySetInnerHTML={{__html: c.html ?? c.text ?? ""}}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
