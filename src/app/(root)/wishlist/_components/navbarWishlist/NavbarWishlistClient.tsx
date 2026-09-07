"use client";

import React, {useCallback, useEffect, useState} from "react";
import {WishlistSheet} from "@/components/shared/sheet/WishlistSheet";
import WishlistNavButton from "./WishlistNavButton";
import {WishlistSheetContent} from "./WishlistSheetContent";

type WishlistItemForClient = {
  id: string | null;
  productId: string;
  createdAt?: string | Date;
  product?: {
    id: string;
    name?: string | null;
    slug?: string | null;
    variants?: Array<{options?: Array<{image?: string[]}>}>;
  } | null;
};

type WishlistForClient = {
  id: string | null;
  name: string | null;
  items: WishlistItemForClient[];
};

type Props = {
  initialWishlist?: WishlistForClient | null;
  isAuthenticated?: boolean;
};

export function NavbarWishlistClient({
  initialWishlist,
  isAuthenticated = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [wishlist, setWishlist] = useState<
    WishlistForClient | null | undefined
  >(initialWishlist ?? null);

  // Fetch current server wishlist
  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) return;
      const json = await res.json();
      const serverWishlist: WishlistForClient | null =
        json?.wishlist ?? json ?? null;
      setWishlist(serverWishlist);
    } catch (e) {
      console.error("Failed to fetch wishlist from server", e);
    }
  }, []);

  useEffect(() => {
    let refetchTimeout: number | undefined;
    const handler = (ev: Event) => {
      try {
        const ce = ev as CustomEvent<{
          productId?: string | undefined;
          inWishlist?: boolean | undefined;
          wishlist?: WishlistForClient | null;
          refresh?: boolean | undefined;
        }>;
        const d = ce.detail;
        if (!d) return;

        // If event provides a full wishlist, merge it with local cache to
        // preserve any existing product metadata (avoid flashing missing images).
        if (d.wishlist) {
          setWishlist((prev) => {
            const server = d.wishlist ?? null;
            if (!server) return null;
            if (!prev) return server;

            // Build a map of server items by productId for quick lookup
            const serverMap = new Map<string, WishlistItemForClient>();
            for (const si of server.items ?? []) {
              serverMap.set(si.productId, si);
            }

            // Merge: prefer server item when it contains product metadata,
            // otherwise keep existing client item to preserve images.
            const mergedItems: WishlistItemForClient[] = [];

            // First include server items in same order, but prefer server.product when present
            for (const si of server.items ?? []) {
              const existing = prev.items?.find(
                (p) => p.productId === si.productId,
              );
              if (si.product && (!existing || !existing.product)) {
                mergedItems.push(si);
              } else if (si.product && existing && existing.product) {
                // merge product fields (server overrides missing fields)
                mergedItems.push({
                  ...si,
                  product: {...(existing.product ?? {}), ...(si.product ?? {})},
                });
              } else if (existing) {
                mergedItems.push(existing);
              } else {
                mergedItems.push(si);
              }
            }

            return {...server, items: mergedItems};
          });
          return;
        }

        // For small optimistic updates require a valid productId
        if (typeof d.productId !== "string" || !d.productId) return;
        const productId = d.productId;

        if (d.inWishlist) {
          setWishlist((prev) => {
            if (!prev) {
              const newItem: WishlistItemForClient = {
                id: `temp-${productId}`,
                productId,
                product: {id: productId, name: "", slug: "", variants: []},
              };
              return {id: null, name: null, items: [newItem]};
            }
            const exists = prev.items.find((it) => it.productId === productId);
            if (exists) return prev;
            const newItem: WishlistItemForClient = {
              id: `temp-${productId}`,
              productId,
              product: {id: productId, name: "", slug: "", variants: []},
            };
            return {...prev, items: [newItem, ...prev.items]};
          });
        } else {
          setWishlist((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              items: prev.items.filter((it) => it.productId !== productId),
            };
          });
        }

        // schedule a background refetch unless event asked to skip
        if (d.refresh === true) {
          fetchWishlist();
          return;
        }
      } catch (e) {
        console.error("wishlist update handler error", e);
      }

      if (refetchTimeout) window.clearTimeout(refetchTimeout);
      refetchTimeout = window.setTimeout(() => fetchWishlist(), 250);
    };

    window.addEventListener("wishlist-updated", handler);
    return () => {
      window.removeEventListener("wishlist-updated", handler);
      if (refetchTimeout) window.clearTimeout(refetchTimeout);
    };
  }, [fetchWishlist]);

  const count = wishlist?.items?.length ?? 0;

  return (
    <>
      <WishlistNavButton onClick={() => setOpen(true)} count={count} />

      <WishlistSheet
        open={open}
        onOpenChange={setOpen}
        showFooterLink={!!isAuthenticated}
      >
        <WishlistSheetContent initialWishlist={wishlist ?? null} />
      </WishlistSheet>
    </>
  );
}
