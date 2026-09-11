"use client";

import React, {useEffect, useState} from "react";
import {ProductWithVariants} from "@/types/product/product";
import ProductCard from "@/components/Product/ProductCard";

type Props = {
  initialProducts: ProductWithVariants[];
  allowedIds?: string[];
};

export default function WishlistGridClient({
  initialProducts,
  allowedIds,
}: Props) {
  const [products, setProducts] = useState<ProductWithVariants[]>(
    initialProducts ?? [],
  );
  // allowedIds: optional list of server-side search result ids to intersect with guest wishlist

  useEffect(() => {
    let mounted = true;

    async function tryLoadFallbackForGuests() {
      // If we already have initial products, nothing to do
      if (products && products.length) return;

      // Try fetching server wishlist (authenticated)
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const json = await res.json();
          const payload = json && json.wishlist ? json.wishlist : json;
          const items = payload?.items ?? ([] as unknown);
          type WishlistItem = {product?: ProductWithVariants};
          const prods = (items as WishlistItem[])
            .map((it) => it.product)
            .filter(Boolean) as ProductWithVariants[];
          if (mounted && prods.length) setProducts(prods);
          return;
        }
        // If 401/403 -> guest, fallthrough
      } catch {
        console.debug("/api/wishlist fetch failed, falling back to guest");
      }

      // Guest fallback: read product ids from localStorage
      try {
        const raw = window.localStorage.getItem("guest_wishlist");
        if (!raw) return;
        let ids: string[] = [];
        try {
          ids = JSON.parse(raw) as string[];
        } catch {
          // maybe stored as comma-separated
          ids = raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        if (!ids.length) return;

        // If allowedIds provided, intersect with server-side search results
        let candidateIds = ids;
        if (Array.isArray(allowedIds) && allowedIds.length) {
          const allowedSet = new Set(allowedIds);
          candidateIds = ids.filter((id) => allowedSet.has(id));
        }
        if (!candidateIds.length) {
          if (mounted) setProducts([]);
          return;
        }

        // Fetch product details from public API for candidate ids
        const url = `/api/products?ids=${encodeURIComponent(candidateIds.join(","))}`;
        const pres = await fetch(url);
        if (!pres.ok) return;
        const prods = (await pres.json()) as ProductWithVariants[];
        if (mounted) setProducts(prods ?? []);
      } catch {
        console.error("Failed to load guest wishlist products");
      }
    }

    tryLoadFallbackForGuests();

    return () => {
      mounted = false;
    };
  }, [allowedIds, products]);

  useEffect(() => {
    const onUpdated = (ev: Event) => {
      try {
        // event detail from WishlistButton: {productId, inWishlist, wishlist}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = (ev as CustomEvent).detail as any;
        if (!d) return;
        const {productId, inWishlist} = d;
        if (!productId) return;

        if (inWishlist === false) {
          // removed: filter out product
          setProducts((prev) => prev.filter((p) => p.id !== productId));
        } else if (inWishlist === true) {
          // added: no-op — we don't fetch new product details here
        }
      } catch (e) {
        // be defensive
        console.error("wishlist-updated handler error", e);
      }
    };

    window.addEventListener("wishlist-updated", onUpdated as EventListener);
    return () => {
      window.removeEventListener(
        "wishlist-updated",
        onUpdated as EventListener,
      );
    };
  }, []);

  if (!products || products.length === 0) {
    return <div className="container">Keine Produkte in der Wunschliste.</div>;
  }

  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-9 w-[85vw] mx-auto">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
