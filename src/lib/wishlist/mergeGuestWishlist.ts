export type MergeGuestWishlistResult = {
  ok: boolean;
  merged?: boolean;
  productIds?: string[];
  error?: string;
};

function parseGuestWishlist(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return [
        ...new Set(
          parsed.filter(
            (value): value is string =>
              typeof value === "string" && value.trim().length > 0,
          ),
        ),
      ];
    }
  } catch {
    // Unterstützung für alte CSV-Werte.
  }

  return [
    ...new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

export async function mergeGuestWishlist(): Promise<MergeGuestWishlistResult> {
  if (typeof window === "undefined") {
    return {
      ok: false,
      error: "no-window",
    };
  }

  try {
    const productIds = parseGuestWishlist(
      window.localStorage.getItem("guest_wishlist"),
    );

    if (productIds.length === 0) {
      window.localStorage.removeItem("guest_wishlist");

      return {
        ok: true,
        merged: false,
        productIds: [],
      };
    }

    const response = await fetch("/api/wishlist/merge", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productIds,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `merge-failed:${response.status}`,
      };
    }

    window.localStorage.removeItem("guest_wishlist");

    return {
      ok: true,
      merged: true,
      productIds,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      ok: false,
      error: message,
    };
  }
}
