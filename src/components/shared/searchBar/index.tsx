"use client";

import React, {useEffect, useState, useTransition} from "react";
import {Input} from "@/components/ui/input";
import {Search, Heart} from "lucide-react";
import {authClient} from "@/lib/auth/auth-client";
import Link from "next/link";
import {useSearchParams, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import CategorySelect from "@/components/shared/category-select";
import {SearchOption} from "@/lib/category/categoryTree";

type SearchInputProps = {
  defaultQuery?: string;
  defaultCategory?: string;
  defaultCategoryPath?: string;
  categoryOptions?: SearchOption[];
};

const ALL_CATEGORIES_VALUE = "__all_categories__";
const normalizeCategoryValue = (input: string) =>
  decodeURIComponent(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

// Category options rendering delegated to shared CategorySelect component

const SearchInput = ({
  defaultQuery = "",
  defaultCategory = "",
  defaultCategoryPath = "",
  categoryOptions,
}: SearchInputProps) => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? defaultQuery;
  const [query, setQuery] = useState(initialQuery);
  const [categoryPath, setCategoryPath] = useState(
    normalizeCategoryValue(defaultCategoryPath ?? defaultCategory ?? ""),
  );
  const [isPending, startTransition] = useTransition();
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let mounted = true;

    async function loadCount() {
      try {
        // Guest quick path
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
          if (mounted) setWishlistCount(ids.length ?? 0);
          return;
        }

        // Fast cached signed-in flag
        const w = window as Window & {__authSignedIn?: boolean};
        if (w.__authSignedIn === true) {
          const res = await fetch("/api/wishlist");
          if (res.ok) {
            const json = await res.json();
            const payload = json?.wishlist ?? json ?? null;
            if (mounted) setWishlistCount((payload?.items ?? []).length ?? 0);
            return;
          }
        }

        // Final attempt: check session then fetch
        try {
          const session = await authClient.getSession();
          function extractUserId(ses: unknown): string | null {
            if (!ses || typeof ses !== "object") return null;
            const rec = ses as Record<string, unknown>;
            if ("user" in rec && rec.user && typeof rec.user === "object") {
              const u = rec.user as Record<string, unknown>;
              if ("id" in u && typeof u.id === "string") return u.id as string;
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
          if (userId) {
            const res = await fetch("/api/wishlist");
            if (res.ok) {
              const json = await res.json();
              const payload = json?.wishlist ?? json ?? null;
              if (mounted) setWishlistCount((payload?.items ?? []).length ?? 0);
            }
          }
        } catch {
          // ignore
        }
      } catch (e) {
        console.error("Failed to load wishlist count", e);
      }
    }

    loadCount();
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for global wishlist updates (dispatched from WishlistButton, Navbar, etc.)
  useEffect(() => {
    const refreshCountFromServer = async () => {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const json = await res.json();
        const payload = json?.wishlist ?? json ?? null;
        setWishlistCount((payload?.items ?? []).length ?? 0);
      } catch {
        /* ignore */
      }
    };

    const handler = (ev: Event) => {
      try {
        type WishlistEventDetail = {
          wishlist?: {items?: unknown[]};
          refresh?: boolean;
        };

        const ce = ev as CustomEvent<WishlistEventDetail>;
        const d = (ce.detail ?? {}) as WishlistEventDetail;

        // If event carried authoritative wishlist payload, use it
        if (d.wishlist && Array.isArray(d.wishlist.items)) {
          setWishlistCount(d.wishlist.items.length ?? 0);
          return;
        }

        // If explicitly asked to refresh
        if (d.refresh === true) {
          // best-effort server refresh
          const w = window as Window & {__authSignedIn?: boolean};
          if (w.__authSignedIn === true) {
            void refreshCountFromServer();
            return;
          }
        }

        // Fallback: adjust from guest localStorage or fetch server for signed-in
        const w = window as Window & {__authSignedIn?: boolean};
        if (w.__authSignedIn === true) {
          void refreshCountFromServer();
          return;
        }

        // guest: read localStorage
        try {
          const raw = window.localStorage.getItem("guest_wishlist");
          if (!raw) {
            setWishlistCount(0);
            return;
          }
          let ids: string[] = [];
          try {
            ids = JSON.parse(raw) as string[];
          } catch {
            ids = raw
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
          setWishlistCount(ids.length ?? 0);
        } catch {
          /* ignore */
        }
      } catch (e) {
        console.error("Error handling wishlist-updated in SearchInput", e);
      }
    };

    window.addEventListener("wishlist-updated", handler as EventListener);
    return () =>
      window.removeEventListener("wishlist-updated", handler as EventListener);
  }, []);

  useEffect(() => {
    setCategoryPath(
      normalizeCategoryValue(defaultCategoryPath ?? defaultCategory ?? ""),
    );
  }, [defaultCategory, defaultCategoryPath]);

  const navigateToSearch = (
    selectedCategoryPath: string,
    params: URLSearchParams,
  ) => {
    const path = selectedCategoryPath
      ? `/search/${selectedCategoryPath}`
      : "/search";
    const search = params.toString();
    startTransition(() => {
      router.push(search ? `${path}?${search}` : path);
    });
  };

  const buildBaseParams = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");

    if (sort) {
      params.set("sort", sort);
    }

    params.set("page", "1");
    return params;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    const params = buildBaseParams();

    if (trimmedQuery) {
      params.set("query", trimmedQuery);
    } else {
      params.delete("query");
    }

    // When user explicitly submits the search (Enter / button), reset category to All
    setCategoryPath("");
    navigateToSearch("", params);
  };

  const handleCategoryChange = (selected: string) => {
    const normalizedSelection = normalizeCategoryValue(selected);
    setCategoryPath(normalizedSelection);
    setQuery("");
    const params = buildBaseParams();
    params.delete("query");
    navigateToSearch(normalizedSelection, params);
  };

  return (
    <form className="space-y-5" onSubmit={handleSearch}>
      <h4 className="text-left text-foreground">
        Wählen Sie Ihre Kategorie aus:
      </h4>
      <div className="flex flex-col lg:flex-row items-start justify-start gap-12">
        <div className="flex items-center gap-2">
          {categoryOptions && (
            <CategorySelect
              value={categoryPath}
              onChange={(val) =>
                handleCategoryChange(val === ALL_CATEGORIES_VALUE ? "" : val)
              }
              className="w-88 md:w-88"
              showAllOption={true}
              options={categoryOptions}
              disabled={isPending}
            />
          )}
        </div>
        <div className="flex items-center justify-start gap-0 w-full">
          <Input
            type="search"
            placeholder="Schnellsuche Outdoor, Jacken, Schuhe, etc."
            className={`md:w-54 h-9 webkit-search-cancel-button:appearance-none overflow-hidden border rounded-md rounded-r-none px-3 py-3 text-base text-foreground inset-0 border-primary/35 shadow-none data-placeholder:italic data-placeholder:text-foreground ${
              isPending ? "opacity-50 pointer-events-none" : ""
            }`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              type="submit"
              className="flex justify-center border-[0.2px] border-boder border-primary/35 transition-transform bg-background/30 rounded-l-none"
            >
              <Search size={14} />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 w-full">
          <Link href="/search/wishlist" aria-label="Wunschliste öffnen">
            <div className="relative">
              <Button
                variant="default"
                type="button"
                className="flex items-center justify-center bg-background/30 hover:bg-background/90 border-[0.2px] border-boder border-primary/35 transition-transform pr-10"
              >
                <span className="pr-2 text-foreground">
                  Meine Wunschliste ({" "}
                  {wishlistCount && wishlistCount > 0 ? wishlistCount : 0} )
                </span>
              </Button>

              {/* absolute heart badge on the right with rounded right corners */}
              <span
                className={`absolute scale-102 top-1/2 right-0 -translate-y-1/2 border-[0.2px] border-boder border-primary/35 rounded-r-md px-2 h-9 w-10 flex items-center justify-center border-l bg-background/90`}
              >
                <Heart
                  className={`${wishlistCount && wishlistCount > 0 ? "text-destructive" : "text-muted-foreground"} w-4 h-4`}
                />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SearchInput;
