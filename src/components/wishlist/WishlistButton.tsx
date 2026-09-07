"use client";

import React, {useState} from "react";
import {HeartIcon} from "lucide-react";
import {Button} from "../ui/button";
import {Tooltip, TooltipTrigger, TooltipContent} from "../ui/tooltip";
import {Variant} from "@/generated/prisma";

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

  // Ensure persisted state across navigation/reload by reconciling with server
  // on mount. This keeps the heart correct after a page refresh or navigation.
  React.useEffect(() => {
    let mounted = true;

    async function reconcile() {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return; // not logged in or other issues

        let jsonBody: unknown = null;
        try {
          jsonBody = await res.json();
        } catch (e) {
          console.error("Failed to parse JSON response from wishlist API", e);
          return;
        }

        // Normalize response shape
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // ignore abort or network errors
      }
    }

    reconcile();

    return () => {
      mounted = false;
    };
  }, [productId]);

  // Guest wishlist support removed: only server-side wishlist is supported.

  // No local hydration for guests.

  const handleClick = async () => {
    if (busy) return;
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
        <Button
          variant="ghost"
          onClick={handleClick}
          aria-pressed={inWishlist}
          aria-label={
            inWishlist
              ? "Aus Wunschliste entfernen"
              : "Zur Wunschliste hinzufügen"
          }
          className={`inline-flex items-center justify-center bg-primary/20 hover:bg-foreground/20 p-1 rounded-full ${className}`}
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
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center" sideOffset={4}>
        {inWishlist
          ? "Aus Wunschliste entfernen"
          : "Zur Wunschliste hinzufügen"}
      </TooltipContent>
    </Tooltip>
  );
}
