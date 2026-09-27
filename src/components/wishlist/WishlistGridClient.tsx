"use client";

import {useEffect, useMemo, useState} from "react";

import ProductCard from "@/components/Product/ProductCard";
import {useWishlistStore} from "@/components/providers/wishlist-provider";
import ProductsSkeleton from "@/app/(root)/skeletons/ProductsSkeleton";
import {ProductWithVariants} from "@/types/product/product";

type Props = {
  initialProducts?: ProductWithVariants[];
  allowedIds?: string[];
};

export default function WishlistGridClient({
  initialProducts = [],
  allowedIds,
}: Props) {
  const {productIds, isLoading: isWishlistLoading} = useWishlistStore();

  const [products, setProducts] =
    useState<ProductWithVariants[]>(initialProducts);
  const [isProductsLoading, setIsProductsLoading] = useState(
    initialProducts.length === 0,
  );

  /*
   * Ein Set ist bei jedem Provider-Update ein neues Objekt.
   * Daraus bauen wir einen stabilen String für die Effect-Dependency.
   */
  const idsKey = useMemo(() => {
    const ids = [...productIds];

    const filteredIds =
      Array.isArray(allowedIds) && allowedIds.length > 0
        ? ids.filter((id) => allowedIds.includes(id))
        : ids;

    return filteredIds.sort().join(",");
  }, [allowedIds, productIds]);

  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];

    if (ids.length === 0) {
      setProducts([]);
      setIsProductsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadProducts() {
      setIsProductsLoading(true);

      try {
        const response = await fetch(
          `/api/products?ids=${encodeURIComponent(ids.join(","))}`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `Wishlist product request failed with status ${response.status}`,
          );
        }

        const data = (await response.json()) as ProductWithVariants[];

        if (!controller.signal.aborted) {
          setProducts(data ?? []);
        }
      } catch (error) {
        const isExpectedAbort =
          error instanceof DOMException &&
          (error.name === "AbortError" || error.name === "TimeoutError");

        if (!isExpectedAbort) {
          console.error("[wishlist-grid] products could not be loaded", error);

          if (!controller.signal.aborted) {
            setProducts([]);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsProductsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      controller.abort();
    };
  }, [idsKey]);

  const isLoading = isWishlistLoading || isProductsLoading;

  if (isLoading) {
    return <ProductsSkeleton limit={8} />;
  }

  if (products.length === 0) {
    return <div className="container">Keine Produkte in der Wunschliste.</div>;
  }

  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-9 w-[85vw] mx-auto">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
