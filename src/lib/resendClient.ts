// Helper wrapper for basic Resend contact/segment operations using the HTTP API.
// This implements best-effort calls and logs failures rather than throwing,
// since the exact Resend API surface may vary across versions.
const API_BASE = "https://api.resend.com";
const API_KEY =
  process.env.RESEND_030_WEB_API_KEY || process.env.RESEND_API_KEY;

async function call(path: string, init: RequestInit = {}) {
  if (!API_KEY) throw new Error("RESEND API key not configured");
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const text = await res.text();
  try {
    return {status: res.status, body: text ? JSON.parse(text) : null};
  } catch (err) {
    return {status: res.status, body: text};
  }
}

export async function findContactByEmail(email: string) {
  try {
    const q = encodeURIComponent(email);
    const resp = await call(`/v1/contacts?email=${q}`);
    if (resp.status === 200 && resp.body && Array.isArray(resp.body.data)) {
      return resp.body.data[0] ?? null;
    }
    // Some API versions may return an object
    if (resp.status === 200 && resp.body && resp.body.data)
      return resp.body.data;
    return null;
  } catch (err) {
    console.error("findContactByEmail failed", err);
    return null;
  }
}

export async function createContact(email: string) {
  try {
    const resp = await call(`/v1/contacts`, {
      method: "POST",
      body: JSON.stringify({email}),
    });
    if (resp.status === 201 || resp.status === 200) return resp.body;
    return null;
  } catch (err) {
    console.error("createContact failed", err);
    return null;
  }
}

export async function addContactToSegment(
  contactId: string,
  segmentId: string,
) {
  try {
    // Try adding by contact id; some API versions accept {contact_id}
    const resp = await call(`/v1/segments/${segmentId}/contacts`, {
      method: "POST",
      body: JSON.stringify({contact_id: contactId}),
    });
    if (resp.status === 200 || resp.status === 201) return resp.body;
    // fallback: try adding by contact id in array
    const resp2 = await call(`/v1/segments/${segmentId}/contacts`, {
      method: "POST",
      body: JSON.stringify({contacts: [{id: contactId}]}),
    });
    if (resp2.status === 200 || resp2.status === 201) return resp2.body;
    return null;
  } catch (err) {
    console.error("addContactToSegment failed", err);
    return null;
  }
}

export async function removeContactFromSegment(
  contactId: string,
  segmentId: string,
) {
  try {
    // Best-effort delete
    const resp = await call(`/v1/segments/${segmentId}/contacts/${contactId}`, {
      method: "DELETE",
    });
    if (resp.status === 200 || resp.status === 204) return true;
    return false;
  } catch (err) {
    console.error("removeContactFromSegment failed", err);
    return false;
  }
}

export async function ensureContactInSegment(email: string, segmentId: string) {
  try {
    let contact = await findContactByEmail(email);
    if (!contact) contact = await createContact(email);
    const contactId =
      contact?.id ?? contact?.contact_id ?? contact?.providerContactId ?? null;
    if (!contactId) return null;
    await addContactToSegment(contactId, segmentId);
    return contactId;
  } catch (err) {
    console.error("ensureContactInSegment failed", err);
    return null;
  }
}

export async function removeEmailFromSegment(email: string, segmentId: string) {
  try {
    const contact = await findContactByEmail(email);
    const contactId = contact?.id ?? contact?.contact_id ?? null;
    if (!contactId) return false;
    return await removeContactFromSegment(contactId, segmentId);
  } catch (err) {
    console.error("removeEmailFromSegment failed", err);
    return false;
  }
}

export default {
  findContactByEmail,
  createContact,
  addContactToSegment,
  removeContactFromSegment,
  ensureContactInSegment,
  removeEmailFromSegment,
};
