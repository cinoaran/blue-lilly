import {resend} from "@/lib/resend/resend";

export type Contact = {
  id: string;
  email: string;
  unsubscribed?: boolean;
  firstName?: string | null;
  lastName?: string | null;
};

export type ContactUpdateResult = {
  id: string;
};

export type CreateContactOptions = {
  firstName?: string;
  lastName?: string;
  segmentId?: string;
  topicId?: string;
  properties?: Record<string, string>;
};

export type UpdateContactInput = {
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
  properties?: Record<string, string>;
};

type ResendErrorLike = {
  message?: string;
  name?: string;
  statusCode?: number;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const maybe = error as {message?: unknown};
    if (typeof maybe.message === "string") return maybe.message;
  }

  return fallback;
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const apiError = error as ResendErrorLike;

  return (
    apiError.statusCode === 404 ||
    apiError.name === "not_found" ||
    apiError.name === "not_found_error"
  );
}

export async function findContactByEmail(
  email: string,
): Promise<Contact | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const {data, error} = await resend.contacts.get({
    email: normalizedEmail,
  });

  if (error) {
    if (isNotFoundError(error)) {
      return null;
    }

    throw new Error(
      getErrorMessage(error, "Resend-Kontakt konnte nicht abgerufen werden"),
    );
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    unsubscribed: data.unsubscribed,
  };
}

export async function createContact(
  email: string,
  options: CreateContactOptions = {},
): Promise<Contact> {
  const normalizedEmail = email.trim().toLowerCase();

  const {data, error} = await resend.contacts.create({
    email: normalizedEmail,
    firstName: options.firstName,
    lastName: options.lastName,
    unsubscribed: false,
    properties: options.properties,

    segments: options.segmentId
      ? [
          {
            id: options.segmentId,
          },
        ]
      : undefined,

    topics: options.topicId
      ? [
          {
            id: options.topicId,
            subscription: "opt_in",
          },
        ]
      : undefined,
  });

  if (error || !data?.id) {
    throw new Error(
      getErrorMessage(error, "Resend-Kontakt konnte nicht erstellt werden"),
    );
  }

  return {
    id: data.id,
    email: normalizedEmail,
    unsubscribed: false,
    firstName: options.firstName ?? null,
    lastName: options.lastName ?? null,
  };
}

export async function addContactToSegment(
  contactId: string,
  segmentId: string,
): Promise<unknown> {
  const {data, error} = await resend.contacts.segments.add({
    contactId,
    segmentId,
  });

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Kontakt konnte nicht zum Resend-Segment hinzugefügt werden",
      ),
    );
  }

  return data;
}

export async function removeContactFromSegment(
  contactId: string,
  segmentId: string,
): Promise<boolean> {
  const {error} = await resend.contacts.segments.remove({
    contactId,
    segmentId,
  });

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Kontakt konnte nicht aus dem Resend-Segment entfernt werden",
      ),
    );
  }

  return true;
}

export async function setContactUnsubscribed(
  contactId: string,
  unsubscribed: boolean,
): Promise<ContactUpdateResult> {
  const {data, error} = await resend.contacts.update({
    id: contactId,
    unsubscribed,
  });

  if (error) {
    throw new Error(
      getErrorMessage(error, "Resend-Kontakt konnte nicht aktualisiert werden"),
    );
  }

  if (!data?.id) {
    throw new Error("Resend lieferte keine Kontakt-ID beim Update zurück");
  }

  return data;
}

export async function updateContact(
  contactId: string,
  payload: UpdateContactInput,
): Promise<ContactUpdateResult> {
  const {data, error} = await resend.contacts.update({
    id: contactId,
    ...payload,
  });

  if (error) {
    throw new Error(
      getErrorMessage(error, "Resend-Kontakt konnte nicht aktualisiert werden"),
    );
  }

  if (!data?.id) {
    throw new Error("Resend lieferte keine Kontakt-ID beim Update zurück");
  }

  return data;
}

export async function getContactById(contactId: string): Promise<Contact> {
  const {data, error} = await resend.contacts.get({
    id: contactId,
  });

  if (error) {
    throw new Error(
      getErrorMessage(error, "Resend-Kontakt konnte nicht abgerufen werden"),
    );
  }

  if (!data) {
    throw new Error("Resend-Kontakt wurde nicht gefunden");
  }

  return {
    id: data.id,
    email: data.email,
    unsubscribed: data.unsubscribed,
  };
}

export async function ensureContactInSegment(
  email: string,
  segmentId: string,
  topicId?: string,
): Promise<string> {
  let contact = await findContactByEmail(email);

  if (!contact) {
    contact = await createContact(email, {
      segmentId,
      topicId,
    });

    return contact.id;
  }

  if (contact.unsubscribed === true) {
    await setContactUnsubscribed(contact.id, false);
  }

  await addContactToSegment(contact.id, segmentId);

  return contact.id;
}

export async function removeEmailFromSegment(
  email: string,
  segmentId: string,
): Promise<boolean> {
  const contact = await findContactByEmail(email);

  if (!contact) {
    return false;
  }

  return removeContactFromSegment(contact.id, segmentId);
}

export async function unsubscribeContact(
  contactId: string,
  segmentId: string,
): Promise<void> {
  await setContactUnsubscribed(contactId, true);

  await removeContactFromSegment(contactId, segmentId);
}

const resendClient = {
  findContactByEmail,
  createContact,
  addContactToSegment,
  removeContactFromSegment,
  setContactUnsubscribed,
  updateContact,
  getContactById,
  ensureContactInSegment,
  removeEmailFromSegment,
  unsubscribeContact,
};

export default resendClient;
