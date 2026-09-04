export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    // Platzhalter: Hier können Resend‑Webhook‑Events oder Admin‑Aufrufe
    // verarbeitet werden. Fürs Erste nur eine Bestätigung zurückgeben.
    return new Response(JSON.stringify({ok: true, received: body}), {
      status: 200,
      headers: {"content-type": "application/json"},
    });
  } catch (err) {
    return new Response(JSON.stringify({ok: false, error: String(err)}), {
      status: 500,
      headers: {"content-type": "application/json"},
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ok: true, message: "Resend API root"}), {
    status: 200,
    headers: {"content-type": "application/json"},
  });
}
