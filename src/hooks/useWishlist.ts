"use client";

import {useCallback, useEffect, useState} from "react";

type WishlistItemForClient = {
  id: string | null;
  productId: string;
  createdAt?: string | Date;
  product?: unknown | null;
};

type WishlistForClient = {
  id: string | null;
  name: string | null;
  items: WishlistItemForClient[];
};

export function useWishlist(
  initial?: WishlistForClient | null,
  isAuthenticated = false,
) {
  const [wishlist, setWishlist] = useState<
    WishlistForClient | null | undefined
  >(initial ?? null);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) return;
      const json = await res.json();
      const serverWishlist = json?.wishlist ?? json ?? null;
      setWishlist(serverWishlist);
    } catch (e) {
      console.error("Failed to fetch wishlist from server", e);
    }
  }, [isAuthenticated]);

  // no-op local storage behavior here; keep minimal to satisfy imports
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  // ----- Guest localStorage helpers -----
  const readGuest = useCallback((): string[] => {
    try {
      const raw = window.localStorage.getItem("guest_wishlist");
      if (!raw) return [];
      try {
        return JSON.parse(raw) as string[];
      } catch {
        return raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch {
      return [];
    }
  }, []);

  const writeGuest = useCallback((ids: string[]) => {
    try {
      window.localStorage.setItem("guest_wishlist", JSON.stringify(ids));
    } catch (e) {
      console.error("Failed to write guest_wishlist", e);
    }
  }, []);

  // ----- Mutations: add / remove / toggle -----
  const add = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        try {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({productId}),
          });
          if (res.ok) {
            // refresh authoritative server wishlist
            await fetchWishlist();
            const json = await res.json().catch(() => null);
            const payload = json?.wishlist ?? null;
            window.dispatchEvent(
              new CustomEvent("wishlist-updated", {
                detail: payload ?? {refresh: true},
              }),
            );
          }
        } catch (e) {
          console.error("Failed to add wishlist item", e);
        }
      } else {
        const ids = readGuest();
        if (!ids.includes(productId)) {
          const next = [...ids, productId];
          writeGuest(next);
          setWishlist({
            id: null,
            name: null,
            items: next.map((p) => ({id: null, productId: p})),
          });
          window.dispatchEvent(
            new CustomEvent("wishlist-updated", {
              detail: {wishlist: {items: next.map((p) => ({productId: p}))}},
            }),
          );
        }
      }
    },
    [isAuthenticated, fetchWishlist, readGuest, writeGuest],
  );

  const remove = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        try {
          // API expects query param for DELETE
          const res = await fetch(
            `/api/wishlist?productId=${encodeURIComponent(productId)}`,
            {
              method: "DELETE",
            },
          );
          if (res.ok) {
            await fetchWishlist();
            const json = await res.json().catch(() => null);
            const payload = json?.wishlist ?? null;
            window.dispatchEvent(
              new CustomEvent("wishlist-updated", {
                detail: payload ?? {refresh: true},
              }),
            );
          }
        } catch (e) {
          console.error("Failed to remove wishlist item", e);
        }
      } else {
        const ids = readGuest();
        const next = ids.filter((id) => id !== productId);
        writeGuest(next);
        setWishlist({
          id: null,
          name: null,
          items: next.map((p) => ({id: null, productId: p})),
        });
        window.dispatchEvent(
          new CustomEvent("wishlist-updated", {
            detail: {wishlist: {items: next.map((p) => ({productId: p}))}},
          }),
        );
      }
    },
    [isAuthenticated, fetchWishlist, readGuest, writeGuest],
  );

  const toggle = useCallback(
    async (productId: string) => {
      // optimistic local behavior for guests
      if (!isAuthenticated) {
        const ids = readGuest();
        if (ids.includes(productId)) {
          await remove(productId);
        } else {
          await add(productId);
        }
        return;
      }

      // For authenticated users, call server toggles: attempt POST, if already exists server will handle idempotency
      try {
        // Try to POST; server may return updated wishlist
        const res = await fetch("/api/wishlist/toggle", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({productId}),
        });
        if (res.ok) {
          const json = await res.json().catch(() => null);
          const payload = json?.wishlist ?? null;
          if (payload) setWishlist(payload);
          // notify others
          window.dispatchEvent(
            new CustomEvent("wishlist-updated", {
              detail: payload ?? {refresh: true},
            }),
          );
          return;
        }

        // Fallback: if toggle endpoint not available, attempt remove/add based on current wishlist
        const current = wishlist?.items?.map((i) => i.productId) ?? [];
        if (current.includes(productId)) {
          await remove(productId);
        } else {
          await add(productId);
        }
      } catch (e) {
        console.error("Failed to toggle wishlist item", e);
      }
    },
    [isAuthenticated, add, remove, wishlist, readGuest],
  );

  return {wishlist, setWishlist, fetchWishlist, add, remove, toggle};
}

export type {WishlistForClient, WishlistItemForClient};
