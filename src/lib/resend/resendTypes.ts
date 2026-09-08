// Minimal, repo-local typings for the Resend SDK methods we use.
// These intentionally only cover the methods used by our codebase.

export interface Contact {
  id?: string;
  contact_id?: string;
  email?: string;
  [k: string]: unknown;
}

export interface ListResponse<T> {
  data?: T[];
  [k: string]: unknown;
}

export interface ContactsApi {
  find?: (opts: {email: string}) => Promise<Contact | null>;
  create?: (payload: {email: string}) => Promise<Contact>;
  list?: () => Promise<ListResponse<Contact> | Contact[]>;
  get?: (id: string) => Promise<Contact>;
  update?: (id: string, payload: Record<string, unknown>) => Promise<Contact>;
  patch?: (id: string, payload: Record<string, unknown>) => Promise<Contact>;
  updateContact?: (
    id: string,
    payload: Record<string, unknown>,
  ) => Promise<Contact>;
}

export interface SegmentsApi {
  add?: (
    segmentId: string,
    payload: Record<string, unknown>,
  ) => Promise<unknown>;
  addContact?: (
    segmentId: string,
    payload: Record<string, unknown>,
  ) => Promise<unknown>;
  addContacts?: (
    segmentId: string,
    payload: Record<string, unknown>,
  ) => Promise<unknown>;
  remove?: (
    segmentId: string,
    payload: Record<string, unknown>,
  ) => Promise<unknown>;
  removeContact?: (segmentId: string, contactId: string) => Promise<unknown>;
}

export interface ResendSdk {
  contacts?: ContactsApi;
  segments?: SegmentsApi;
  [k: string]: unknown;
}

export default ResendSdk;
