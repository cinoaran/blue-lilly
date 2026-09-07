"use client";

import React, {useEffect, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {CameraOff} from "lucide-react";
import {Button} from "@/components/ui/button";

type WishlistItemForClient = {
  id: string | null;
  productId: string;
  createdAt?: string | Date;
  product?: {
    id: string;
    name?: string | null;
    slug?: string | null;
    mainImage?: string | null;
    variants?: Array<{
      options?: Array<{image?: string[]; quantity?: number}>;
    }>;
  } | null;
};

type WishlistForClient = {
  id: string | null;
  name: string | null;
  items: WishlistItemForClient[];
};

export function WishlistSheetContent({
  initialWishlist,
}: {
  initialWishlist?: WishlistForClient | null;
  wishlistForClient?: WishlistForClient | null;
}) {
  const [localWishlist, setLocalWishlist] = useState<WishlistForClient | null>(
    initialWishlist ?? null,
  );
  // keep local wishlist in sync when parent prop changes
  useEffect(() => setLocalWishlist(initialWishlist ?? null), [initialWishlist]);
  const w = localWishlist ?? null;

  const [imageCache, setImageCache] = useState<Record<string, string | null>>(
    {},
  );
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>(
    {},
  );
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});

  async function handleAddToCart(productId: string) {
    if (!productId) return;
    setAddingIds((s) => ({...s, [productId]: true}));
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({productId, quantity: 1}),
      });
      if (!res.ok) {
        console.error("Failed to add to cart", await res.text());
      } else {
        try {
          await handleRemove(productId);
        } catch (e) {
          console.error(
            "Failed to remove from wishlist after adding to cart",
            e,
          );
          // ignore removal errors
        }
      }
    } catch (e) {
      console.error("add to cart error", e);
    } finally {
      setAddingIds((s) => {
        const n = {...s};
        delete n[productId];
        return n;
      });
    }
  }

  useEffect(() => {
    if (!w?.items?.length) return;
    const idsToFetch: string[] = [];
    for (const it of w.items) {
      const pid = it.productId;
      const src = getFirstImageUrl(it.product);
      if (!src && imageCache[pid] === undefined && !loadingIds[pid]) {
        idsToFetch.push(pid);
      }
    }
    if (idsToFetch.length === 0) return;

    const fetchIds = idsToFetch.join(",");
    (async () => {
      try {
        setLoadingIds((s) => {
          const n = {...s};
          for (const id of idsToFetch) n[id] = true;
          return n;
        });

        const url = `/api/products?ids=${encodeURIComponent(fetchIds)}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        type ProductFromApi = {
          id?: string;
          mainImage?: string | null;
          variants?: Array<{
            options?: Array<{image?: string[]; quantity?: number}>;
          }>;
          name?: string | null;
          slug?: string | null;
        };
        const prods: ProductFromApi[] = Array.isArray(json)
          ? (json as ProductFromApi[])
          : ((json?.products as ProductFromApi[]) ?? []);
        const updates: Record<string, string | null> = {};
        for (const p of prods) {
          if (!p?.id) continue;
          let found: string | null = null;
          if (p.mainImage && typeof p.mainImage === "string")
            found = p.mainImage;
          if (!found && Array.isArray(p.variants)) {
            for (const v of p.variants) {
              const opts = v?.options ?? [];
              for (const o of opts) {
                const imgs = o?.image ?? [];
                if (
                  Array.isArray(imgs) &&
                  imgs.length > 0 &&
                  typeof imgs[0] === "string"
                ) {
                  found = imgs[0];
                  break;
                }
              }
              if (found) break;
            }
          }
          updates[p.id] = found ?? null;
        }
        setImageCache((s) => ({...s, ...updates}));
      } catch (e) {
        console.error("Failed to fetch wishlist images", e);
      } finally {
        setLoadingIds((s) => {
          const n = {...s};
          for (const id of idsToFetch) delete n[id];
          return n;
        });
      }
    })();
  }, [w, imageCache, loadingIds]);

  async function handleRemove(productId: string) {
    if (!productId) return;
    setProcessingIds((s) => ({...s, [productId]: true}));
    try {
      const url = `/api/wishlist?productId=${encodeURIComponent(productId)}`;
      const res = await fetch(url, {method: "DELETE"});
      if (!res.ok) {
        console.error("Failed to remove wishlist item", await res.text());
        return;
      }
      const json = await res.json();
      const serverWishlist: WishlistForClient | null =
        json?.wishlist ?? json ?? null;
      // update local UI
      setLocalWishlist(serverWishlist);
      // notify other listeners (NavbarWishlistClient will merge)
      try {
        window.dispatchEvent(
          new CustomEvent("wishlist-updated", {
            detail: {wishlist: serverWishlist},
          }),
        );
      } catch (e) {
        console.error("Failed to dispatch wishlist-updated event", e);
        // ignore dispatch errors
      }
    } catch (e) {
      console.error("remove wishlist item error", e);
    } finally {
      setProcessingIds((s) => {
        const n = {...s};
        delete n[productId];
        return n;
      });
    }
  }

  function getFirstImageUrl(
    product?: WishlistItemForClient["product"],
  ): string | null {
    if (!product) return null;
    // prefer explicit mainImage if present
    const mainImage = product?.mainImage as string | null | undefined;
    if (typeof mainImage === "string" && mainImage.length > 0) return mainImage;

    const variants = product.variants ?? [];
    for (const v of variants) {
      const opts = v?.options ?? [];
      for (const o of opts) {
        const imgs = o?.image ?? [];
        if (
          Array.isArray(imgs) &&
          imgs.length > 0 &&
          typeof imgs[0] === "string"
        ) {
          return imgs[0];
        }
      }
    }
    return null;
  }

  // If no server-provided wishlist (unauthenticated), prompt to register or login
  if (w === null) {
    return (
      <div className="container mx-auto flex flex-col items-center gap-4 bg-primary/10 w-70 p-5 rounded-md text-sm text-muted-foreground text-center">
        <p className="mb-4">
          Um Ihre Wunschliste verwalten zu können, ist es notwendig sich zu
          registrieren oder einloggen.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            Registrierung
          </Link>
        </div>
      </div>
    );
  }

  if (!w.items || w.items.length === 0) {
    return (
      <div className="container mx-auto bg-primary/10 w-70 p-5 rounded-md text-sm text-muted-foreground text-center">
        <p className="mb-4">
          Deine Wunschliste ist aktuell leer. Du kannst Produkte im Shop
          hinzufügen.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Zum Shop
        </Link>
      </div>
    );
  }

  return (
    <ul className="block space-y-3 px-4">
      {w.items.slice(0, 10).map((it) => {
        const imgSrc =
          getFirstImageUrl(it.product) ?? imageCache[it.productId] ?? null;
        const isExternal =
          typeof imgSrc === "string" && imgSrc.startsWith("http");
        // determine availability: any option with quantity > 0
        const isAvailable = Boolean(
          it.product &&
          Array.isArray(it.product.variants) &&
          it.product.variants.some((v) =>
            Array.isArray(v?.options)
              ? v!.options!.some((o) => (o?.quantity ?? 0) > 0)
              : false,
          ),
        );
        return (
          <li
            key={it.productId}
            className="flex flex-col justify-center items-center gap-4 py-2 border-b border-border"
          >
            {isAvailable && it.product?.slug ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/product/${it.product.slug}`}
                      className="flex items-center gap-3"
                      aria-label={`Zu den Produktdetails: ${it.product?.name ?? "Produkt"}`}
                    >
                      <div className="relative w-18 h-22">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={it.product?.name ?? "Produkt"}
                            fill
                            sizes="48px"
                            loading="lazy"
                            unoptimized={isExternal}
                            className="object-cover rounded"
                          />
                        ) : loadingIds[it.productId] ? (
                          <div className="w-18 h-22 bg-muted rounded animate-pulse" />
                        ) : (
                          <div className="w-18 h-22 flex items-center justify-center bg-muted rounded">
                            <CameraOff className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{it.product?.name}</div>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6} side="bottom">
                    Zu den Produktdetails
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={it.product?.name ?? "Produkt"}
                      fill
                      sizes="48px"
                      loading="lazy"
                      unoptimized={isExternal}
                      className="object-cover rounded"
                    />
                  ) : loadingIds[it.productId] ? (
                    <div className="w-12 h-12 bg-muted rounded animate-pulse" />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                      <CameraOff className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{it.product?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Leider noch nicht verfügbar
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              {isAvailable ? (
                <Button
                  variant="default"
                  onClick={() => handleAddToCart(it.productId)}
                  disabled={!!addingIds[it.productId]}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm text-foreground hover:bg-primary/90"
                >
                  {addingIds[it.productId]
                    ? "Wird hinzugefügt..."
                    : "In den Warenkorb"}
                </Button>
              ) : null}

              <Button
                variant="outline"
                aria-label="Entfernen"
                onClick={() => handleRemove(it.productId)}
                disabled={!!processingIds[it.productId]}
                className="text-sm text-destructive hover:underline px-2 py-1"
              >
                {processingIds[it.productId] ? "Entferne..." : "Entfernen"}
              </Button>
            </div>
          </li>
        );
      })}
      {/* Footer already includes link to full wishlist; no duplicate here */}
    </ul>
  );
}
