import {ensureAndRequire} from "@/acl/acl";

// Server-side helper to require a permission for actions (uses next/headers when available)
export async function requireServerPermission(permission: string) {
  // headers() from next/headers returns a Headers object in the server runtime.
  // Narrow type so it matches ensureAndRequire's expected HeadersInit/Headers type.
  let hdrs: Headers | undefined = undefined;
  try {
    const mod = await import("next/headers");
    if (mod && typeof mod.headers === "function") {
      // next/headers.headers() returns a Headers object in server runtime
      hdrs = (await mod.headers()) as Headers;
    }
  } catch {
    // ignore — fallback to letting ensureAndRequire handle missing headers
  }

  return await ensureAndRequire({headers: hdrs}, permission);
}

export default requireServerPermission;
