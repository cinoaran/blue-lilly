export async function mergeGuestWishlist(): Promise<{
  ok: boolean;
  merged?: boolean;
  error?: string;
}> {
  try {
    if (typeof window === "undefined") return {ok: false, error: "no-window"};

    const raw = localStorage.getItem("guest_wishlist");
    if (!raw) return {ok: true, merged: false};

    let productIds: string[] = [];
    try {
      productIds = JSON.parse(raw) as string[];
    } catch {
      // invalid payload -> clear it
      localStorage.removeItem("guest_wishlist");
      return {ok: true, merged: false};
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      localStorage.removeItem("guest_wishlist");
      return {ok: true, merged: false};
    }

    const res = await fetch("/api/wishlist/merge", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({productIds}),
    });

    if (!res.ok) {
      return {ok: false, error: `merge-failed:${res.status}`};
    }

    // On success clear guest wishlist
    localStorage.removeItem("guest_wishlist");
    return {ok: true, merged: true};
  } catch (err: unknown) {
    const errorMsg =
      typeof err === "string"
        ? err
        : err && typeof err === "object" && "message" in err
          ? String((err as {message?: unknown}).message ?? err)
          : String(err);
    return {ok: false, error: errorMsg};
  }
}
