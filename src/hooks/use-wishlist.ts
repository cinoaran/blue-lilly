"use client";

import {useCallback} from "react";

import {useWishlistStore} from "@/components/providers/wishlist-provider";

type UseWishlistResult = {
  isInWishlist: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  toggleWishlist: () => Promise<void>;
};

export function useWishlist(productId: string): UseWishlistResult {
  const {productIds, isLoading, isAuthenticated, toggleProduct} =
    useWishlistStore();

  const toggleWishlist = useCallback(() => {
    return toggleProduct(productId);
  }, [productId, toggleProduct]);

  return {
    isInWishlist: productIds.has(productId),
    isLoading,
    isAuthenticated,
    toggleWishlist,
  };
}
