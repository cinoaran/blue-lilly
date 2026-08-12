import {getSessionOnce} from "@/lib/session/sessionCache";
import {roleHasPermission} from "./policies";

// Type alias to mirror better-auth Session type (importing concrete type can be done if needed)
import type {Session as AuthSession} from "@/lib/auth/auth";

export type Session = AuthSession | null;

export async function ensureSession(
  opts: Parameters<typeof getSessionOnce>[0] = {},
): Promise<Session> {
  // If no headers provided and we are running on the server, try to load next/headers dynamically
  if (!opts.headers && typeof window === "undefined") {
    try {
      const mod = await import("next/headers");
      const dynamicHeaders = mod?.headers;
      if (typeof dynamicHeaders === "function") {
        opts.headers = await dynamicHeaders();
      }
    } catch {
      // ignore: dynamic import may fail in environments where next/headers isn't available
    }
  }

  const session = await getSessionOnce(opts);
  return session;
}

export function requirePermission(session: Session, permission: string) {
  if (!session) throw new Error("Unauthorized");
  const role = (session as AuthSession).user?.role as string | undefined;
  if (!role) throw new Error("Unauthorized");
  const ok = roleHasPermission(role, permission);
  if (!ok) throw new Error("Forbidden");
  return true;
}

// Convenience wrapper: await ensureSession then requirePermission
export async function ensureAndRequire(
  opts: Parameters<typeof ensureSession>[0],
  permission: string,
): Promise<AuthSession> {
  const session = await ensureSession(opts);
  requirePermission(session, permission);
  // At this point requirePermission threw if session was null/unauthorized
  return session as AuthSession;
}
