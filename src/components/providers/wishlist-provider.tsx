"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {authClient} from "@/lib/auth/auth-client";

type WishlistItemForClient = {
  id?: string;
  productId: string;
};

type WishlistForClient = {
  id?: string | null;
  name?: string | null;
  items?: WishlistItemForClient[];
};

type WishlistApiResponse =
  | WishlistForClient
  | {
      wishlist?: WishlistForClient | null;
    };

type WishlistContextValue = {
  productIds: Set<string>;
  isLoading: boolean;
  isAuthenticated: boolean;
  toggleProduct: (productId: string) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function extractWishlistPayload(
  body: WishlistApiResponse | null,
): WishlistForClient | null {
  if (body && typeof body === "object" && "wishlist" in body) {
    return body.wishlist ?? null;
  }

  return body as WishlistForClient | null;
}

function parseGuestWishlist(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (value): value is string => typeof value === "string",
      );
    }
  } catch {
    // Fallback for alte CSV-Werte.
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readGuestWishlist(): string[] {
  try {
    return parseGuestWishlist(window.localStorage.getItem("guest_wishlist"));
  } catch (error) {
    console.error("[wishlist] guest wishlist could not be read", error);
    return [];
  }
}

function writeGuestWishlist(productIds: string[]): void {
  try {
    window.localStorage.setItem(
      "guest_wishlist",
      JSON.stringify([...new Set(productIds)]),
    );
  } catch (error) {
    console.error("[wishlist] guest wishlist could not be written", error);
  }
}

export function WishlistProvider({children}: {children: React.ReactNode}) {
  const {data: session, isPending: isSessionPending} = authClient.useSession();

  const userId = session?.user?.id ?? null;
  const isAuthenticated = Boolean(userId);

  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchedUserIdRef = useRef<string | null | undefined>(undefined);
  const requestControllerRef = useRef<AbortController | null>(null);

  const loadWishlist = useCallback(async () => {
    if (!userId) {
      setProductIds(new Set(readGuestWishlist()));
      setIsLoading(false);
      return;
    }

    requestControllerRef.current?.abort();

    const controller = new AbortController();
    requestControllerRef.current = controller;

    setIsLoading(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });

      if (response.status === 401) {
        setProductIds(new Set());
        return;
      }

      if (!response.ok) {
        throw new Error(`Wishlist request failed: ${response.status}`);
      }

      const body = (await response.json()) as WishlistApiResponse;
      const wishlist = extractWishlistPayload(body);

      if (!controller.signal.aborted) {
        setProductIds(
          new Set(
            (wishlist?.items ?? [])
              .map((item) => item.productId)
              .filter((id): id is string => Boolean(id)),
          ),
        );
      }
    } catch (error) {
      const isExpectedAbort =
        error instanceof DOMException &&
        (error.name === "AbortError" || error.name === "TimeoutError");

      if (!isExpectedAbort) {
        console.error("[wishlist] loading failed", error);

        if (!controller.signal.aborted) {
          setProductIds(new Set());
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (isSessionPending) {
      return;
    }

    /*
     * Lädt nur einmal pro Nutzer.
     * `undefined` = noch nie geladen.
     * `null` = einmal im Gastmodus geladen.
     * "abc..." = einmal für diesen eingeloggten User geladen.
     */
    if (fetchedUserIdRef.current === userId) {
      return;
    }

    fetchedUserIdRef.current = userId;

    void loadWishlist();

    return () => {
      requestControllerRef.current?.abort();
    };
  }, [isSessionPending, loadWishlist, userId]);

  const toggleProduct = useCallback(
    async (productId: string) => {
      if (!productId || isLoading) {
        return;
      }

      const wasInWishlist = productIds.has(productId);

      // Gast: nur localStorage aktualisieren
      if (!userId) {
        const nextProductIds = new Set(productIds);

        if (wasInWishlist) {
          nextProductIds.delete(productId);
        } else {
          nextProductIds.add(productId);
        }

        setProductIds(nextProductIds);
        writeGuestWishlist([...nextProductIds]);

        return;
      }

      setIsLoading(true);

      try {
        const response = wasInWishlist
          ? await fetch(
              `/api/wishlist?productId=${encodeURIComponent(productId)}`,
              {
                method: "DELETE",
                credentials: "include",
              },
            )
          : await fetch("/api/wishlist", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({productId}),
            });

        if (!response.ok) {
          throw new Error(`Wishlist update failed: ${response.status}`);
        }

        const body = (await response.json()) as WishlistApiResponse;
        const wishlist = extractWishlistPayload(body);

        setProductIds(
          new Set(
            (wishlist?.items ?? [])
              .map((item) => item.productId)
              .filter((id): id is string => Boolean(id)),
          ),
        );
      } catch (error) {
        console.error("[wishlist] update failed", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, productIds, userId],
  );

  const removeProduct = useCallback(
    async (productId: string) => {
      if (!productIds.has(productId)) {
        return;
      }

      await toggleProduct(productId);
    },
    [productIds, toggleProduct],
  );

  const value = useMemo(
    () => ({
      productIds,
      isLoading: isSessionPending || isLoading,
      isAuthenticated,
      toggleProduct,
      removeProduct,
      refreshWishlist: loadWishlist,
    }),
    [
      productIds,
      isLoading,
      isSessionPending,
      isAuthenticated,
      toggleProduct,
      removeProduct,
      loadWishlist,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistStore() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlistStore must be used inside WishlistProvider.");
  }

  return context;
}
