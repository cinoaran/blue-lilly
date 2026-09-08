"use client";

import React, {useState, useEffect} from "react";
import {HeartIcon} from "lucide-react";
import {Button} from "../ui/button";
import {Tooltip, TooltipTrigger, TooltipContent} from "../ui/tooltip";
import {Variant} from "@/generated/prisma";
import {authClient} from "@/lib/auth/auth-client";

type WishlistItemForClient = {
  id: string | null;
  productId: string;
  createdAt?: string | Date;
  product?: {
    id: string;
    name?: string | null;
    slug?: string | null;
    variants?: Variant[];
  } | null;
};

type WishlistForClient = {
  id: string | null;
  name: string | null;
  items: WishlistItemForClient[];
};

type Props = {
  productId: string;
  initialInWishlist?: boolean;
  size?: number;
  className?: string;
};

export default function WishlistButton({
  productId,
  initialInWishlist = false,
  size = 24,
  className = "",
}: Props) {
  const [inWishlist, setInWishlist] = useState<boolean>(initialInWishlist);
  const [busy, setBusy] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Ensure persisted state across navigation/reload by reconciling with server
  // on mount. This keeps the heart correct after a page refresh or navigation.
  useEffect(() => {
    let mounted = true;

    async function checkAuthAndReconcile() {
      // Fast-path: if a guest wishlist exists in localStorage, treat user as
      // guest and avoid calling the auth API (prevents calls to
      // /api/auth/get-session for not-logged-in users).
      try {
        const rawGuest = window.localStorage.getItem("guest_wishlist");
        if (rawGuest) {
          setIsAuthenticated(false);
          try {
            let ids: string[] = [];
            try {
              ids = JSON.parse(rawGuest) as string[];
            } catch {
              ids = rawGuest
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            }
            const exists = ids.includes(productId);
            setInWishlist(Boolean(exists));
          } catch (e) {
            console.error("Failed to parse guest_wishlist fastpath", e);
          }
          return;
        }
      } catch {
        // Ignore localStorage errors and fall back to normal flow
      }
      try {
        // check session via authClient; cache only a positive login result on window
        const w = window as Window & {__authSignedIn?: boolean};
        // treat undefined and false as unknown — force a fresh check unless we have a known `true`
        let cached: boolean | undefined =
          w.__authSignedIn === true ? true : undefined;
        if (typeof cached === "undefined") {
          try {
            const session = await authClient.getSession();
            function extractUserId(s: unknown): string | null {
              if (!s || typeof s !== "object") return null;
              const rec = s as Record<string, unknown>;
              if ("user" in rec && rec.user && typeof rec.user === "object") {
                const u = rec.user as Record<string, unknown>;
                if ("id" in u && typeof u.id === "string")
                  return u.id as string;
              }
              if ("data" in rec && rec.data && typeof rec.data === "object") {
                const d = rec.data as Record<string, unknown>;
                if ("user" in d && d.user && typeof d.user === "object") {
                  const u = d.user as Record<string, unknown>;
                  if ("id" in u && typeof u.id === "string")
                    return u.id as string;
                }
              }
              return null;
            }

            const userId = extractUserId(session);
            cached = Boolean(userId);
          } catch {
            cached = false;
          }
          // only persist a positive authenticated state to avoid stale `false`
          if (cached === true) w.__authSignedIn = true;
        }
        if (!mounted) return;
        setIsAuthenticated(Boolean(cached));

        if (!cached) {
          // guest: reconcile with localStorage guest_wishlist
          try {
            const raw = window.localStorage.getItem("guest_wishlist");
            if (raw) {
              let ids: string[] = [];
              try {
                ids = JSON.parse(raw) as string[];
              } catch {
                ids = raw
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
              }
              const exists = ids.includes(productId);
              setInWishlist(Boolean(exists));
            }
          } catch (e) {
            console.error("Failed to read guest_wishlist", e);
          }
          return;
        }

        // signed-in: fetch wishlist to set initial state
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        let jsonBody: unknown = null;
        try {
          jsonBody = await res.json();
        } catch (e) {
          console.error("Failed to parse JSON response from wishlist API", e);
          return;
        }

        const payload =
          jsonBody &&
          typeof jsonBody === "object" &&
          "wishlist" in (jsonBody as {wishlist?: WishlistForClient | null})
            ? (jsonBody as {wishlist?: WishlistForClient | null}).wishlist
            : (jsonBody as WishlistForClient | null);

        if (!mounted || !payload) return;
        const exists = (payload.items ?? []).some(
          (it: WishlistItemForClient) => it.productId === productId,
        );
        setInWishlist(exists);
      } catch (e) {
        console.error("Failed to reconcile wishlist state", e);
      }
    }

    checkAuthAndReconcile();

    return () => {
      mounted = false;
    };
  }, [productId]);

  // Guest wishlist support removed: only server-side wishlist is supported.

  // No local hydration for guests.

  const handleClick = async () => {
    if (busy) return;
    if (isAuthenticated === false) {
      // Toggle guest localStorage wishlist
      try {
        const raw = window.localStorage.getItem("guest_wishlist");
        let ids: string[] = [];
        if (raw) {
          try {
            ids = JSON.parse(raw) as string[];
          } catch {
            ids = raw
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
        }

        const already = ids.includes(productId);
        let nextIds: string[];
        let nextState: boolean;
        if (already) {
          nextIds = ids.filter((id) => id !== productId);
          nextState = false;
        } else {
          nextIds = [...ids, productId];
          nextState = true;
        }

        try {
          window.localStorage.setItem(
            "guest_wishlist",
            JSON.stringify(nextIds),
          );
        } catch {
          // fall back to CSV
          window.localStorage.setItem("guest_wishlist", nextIds.join(","));
        }

        setInWishlist(nextState);
        try {
          window.dispatchEvent(
            new CustomEvent("wishlist-updated", {
              detail: {productId, inWishlist: nextState, wishlist: null},
            }),
          );
        } catch (e) {
          console.error(
            "Failed to dispatch wishlist-updated event for guest",
            e,
          );
        }
      } catch (e) {
        console.error("Failed to toggle guest_wishlist", e);
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    console.debug("WishlistButton.handleClick start", {productId, inWishlist});

    try {
      // Try authenticated API first
      const method = inWishlist ? "DELETE" : "POST";
      let res: Response;
      if (method === "DELETE") {
        // DELETE endpoint expects productId as query param
        const url = `/api/wishlist?productId=${encodeURIComponent(productId)}`;
        res = await fetch(url, {method});
      } else {
        res = await fetch("/api/wishlist", {
          method,
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({productId}),
        });
      }

      // If server returns OK, use its representation to reconcile.
      if (res.ok) {
        // Normalize JSON response: API may return either { wishlist: ... } or the
        // wishlist object directly. Be defensive in parsing to satisfy TS types.
        let jsonBody: unknown = null;
        try {
          jsonBody = await res.json();
        } catch (e) {
          console.error("Failed to parse JSON response from wishlist API", e);
          jsonBody = null;
        }

        let payload: WishlistForClient | null = null;
        if (
          jsonBody &&
          typeof jsonBody === "object" &&
          !Array.isArray(jsonBody) &&
          "wishlist" in jsonBody
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload = (jsonBody as any).wishlist as WishlistForClient;
        } else {
          payload = (jsonBody as WishlistForClient) ?? null;
        }

        const nextState = payload
          ? (payload.items ?? []).some(
              (it: WishlistItemForClient) => it.productId === productId,
            )
          : !inWishlist;

        setInWishlist(nextState);
        try {
          window.dispatchEvent(
            new CustomEvent("wishlist-updated", {
              detail: {productId, inWishlist: nextState, wishlist: payload},
            }),
          );
        } catch (e) {
          console.error("Failed to dispatch wishlist-updated event", e);
          /* ignore */
        }

        setBusy(false);
        return;
      }

      // If server responded with 401/403 (unauthenticated): no-op (guest localStorage removed)
      if (res.status === 401 || res.status === 403) {
        return;
      }

      // Other errors: log and don't change client state
      if (!res.ok) {
        console.error("Failed to update wishlist: non-ok response", res.status);
        return;
      }
    } catch (e) {
      console.error("Failed to update wishlist via API", e);
    } finally {
      setBusy(false);
      console.debug("WishlistButton.handleClick end", {productId, inWishlist});
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center justify-center bg-primary/20 hover:bg-foreground/20 p-1 rounded-full ${className}`}
          aria-disabled={busy}
        >
          <Button
            variant="ghost"
            onClick={handleClick}
            aria-pressed={inWishlist}
            aria-label={
              inWishlist
                ? "Aus Wunschliste entfernen"
                : "Zur Wunschliste hinzufügen"
            }
            className="inline-flex items-center justify-center"
            disabled={busy}
          >
            <HeartIcon
              size={size}
              className={
                inWishlist ? "text-destructive" : "text-muted-foreground"
              }
            />
            <span className="sr-only">
              {inWishlist ? "In wishlist" : "Not in wishlist"}
            </span>
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center" sideOffset={4}>
        {inWishlist
          ? "Aus Wunschliste entfernen"
          : "Zur Wunschliste hinzufügen"}
      </TooltipContent>
    </Tooltip>
  );
}
