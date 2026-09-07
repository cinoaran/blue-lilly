"use client";
import Image from "next/image";
import React from "react";
import {useEffect, useState} from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

type WishlistProduct = {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | null;
    currency: "EUR";
    image: string | null;
    available?: boolean;
  };
};

type WishlistResponse = {
  wishlist: {
    id: string | null;
    name: string | null;
    items: WishlistProduct[];
  };
};

export default function WishlistPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});
  const [cartProcessing, setCartProcessing] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      try {
        const res = await fetch("/api/wishlist", {method: "GET"});

        if (res.status === 401 || res.status === 403 || res.status === 404) {
          if (!cancelled) {
            setError("auth");
            setLoading(false);
          }
          return;
        }

        if (!res.ok) throw new Error(`Failed to load wishlist: ${res.status}`);

        const data = (await res.json()) as WishlistResponse;

        if (!cancelled) {
          setWishlistItems(data.wishlist.items ?? []);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("load");
          setLoading(false);
        }
      }
    }

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, []);

  // If unauthenticated, redirect to login immediately
  const router = useRouter();
  useEffect(() => {
    if (error === "auth") {
      router.push("/login");
    }
  }, [error, router]);

  async function handleRemove(productId: string) {
    setWishlistItems((prev) => prev.filter((i) => i.productId !== productId));

    try {
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await fetch("/api/wishlist").then((r) =>
          r.ok ? r.json() : null,
        )) as WishlistResponse | null;
        setWishlistItems(data?.wishlist.items ?? []);
      }
    } catch {
      const data = (await fetch("/api/wishlist").then((r) =>
        r.ok ? r.json() : null,
      )) as WishlistResponse | null;
      setWishlistItems(data?.wishlist.items ?? []);
    }
  }

  async function handleAddToCart(
    productId: string,
    wishlistProductId?: string,
  ) {
    if (!productId) return;
    setCartProcessing((s) => ({...s, [productId]: true}));
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({productId, quantity: 1}),
      });

      if (!res.ok) {
        alert("Produkt konnte nicht zum Warenkorb hinzugefügt werden.");
        return;
      }

      // remove from wishlist if we have the wishlist item id
      if (wishlistProductId) {
        setWishlistItems((prev) =>
          prev.filter((i) => i.productId !== wishlistProductId),
        );
        try {
          await fetch(
            `/api/wishlist?productId=${encodeURIComponent(wishlistProductId)}`,
            {
              method: "DELETE",
            },
          );
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.error(e);
      alert("Produkt konnte nicht zum Warenkorb hinzugefügt werden.");
    } finally {
      setCartProcessing((s) => {
        const n = {...s};
        delete n[productId];
        return n;
      });
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Deine Wunschliste</h1>
        <p className="text-muted-foreground">Lade deine Wunschliste …</p>
      </div>
    );
  }

  if (error === "auth") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Deine Wunschliste</h1>
        <div className="rounded-md border p-6">
          <p className="mb-4">
            Bitte melde dich an, um deine Wunschliste anzusehen.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Zum Login
          </Link>
        </div>
      </div>
    );
  }

  if (error === "load") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Deine Wunschliste</h1>
        <div className="rounded-md border p-6">
          <p className="text-destructive">
            Die Wunschliste konnte nicht geladen werden. Bitte versuche es
            später erneut.
          </p>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Deine Wunschliste</h1>
        <div className="rounded-md border p-6">
          <p className="mb-4">
            Deine Wunschliste ist aktuell leer. Du kannst Produkte von den
            Produktseiten zu deiner Wunschliste hinzufügen.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Zum Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 my-12">
      <h1 className="text-2xl font-semibold mb-6">Deine Wunschliste</h1>

      <ul className="space-y-4">
        {wishlistItems.map((item) => {
          const product = item.product;
          return (
            <li
              key={item.id}
              className="flex flex-col items-center gap-4 rounded-md border-[0.3px] border-border p-6"
            >
              {product.image ? (
                product.available ? (
                  <TooltipProvider>
                    <Tooltip key={product.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/product/${product.slug}`}
                          aria-label={`Zu den Produktdetails: ${product.name}`}
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={90}
                            height={90}
                            className="h-30 w-25 object-cover rounded"
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6} side="bottom">
                        Zu den Produktdetails
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-cover rounded"
                  />
                )
              ) : (
                <div className="h-20 w-20 bg-muted rounded" />
              )}

              <div className="flex-1">
                {product.available ? (
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-foreground font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                ) : (
                  <div className="font-medium">{product.name}</div>
                )}
                {product.available ? (
                  product.price != null ? (
                    <p className="text-sm text-muted-foreground">
                      {product.price.toFixed(2)} {product.currency}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Preis auf Anfrage
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Leider noch nicht verfügbar
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Product details link removed per request */}

                {product.available ? (
                  <Button
                    variant="default"
                    onClick={() => handleAddToCart(product.id, item.productId)}
                    disabled={!!cartProcessing[product.id]}
                    className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-3 text-sm text-foreground hover:bg-primary/90"
                  >
                    {cartProcessing[product.id]
                      ? "Wird hinzugefügt..."
                      : "In den Warenkorb"}
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  onClick={() => handleRemove(item.productId)}
                  className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  Entfernen
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
