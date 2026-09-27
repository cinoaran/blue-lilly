"use client";

import React, {useEffect, useState, useTransition} from "react";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {Heart, Search} from "lucide-react";

import {useWishlistStore} from "@/components/providers/wishlist-provider";
import {Button} from "@/components/ui/button";
import CategorySelect from "@/components/shared/category-select";
import {Input} from "@/components/ui/input";
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

const SearchInput = ({
  defaultQuery = "",
  defaultCategory = "",
  defaultCategoryPath = "",
  categoryOptions,
}: SearchInputProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("query") ?? defaultQuery;

  const [query, setQuery] = useState(initialQuery);
  const [categoryPath, setCategoryPath] = useState(
    normalizeCategoryValue(defaultCategoryPath ?? defaultCategory ?? ""),
  );
  const [isPending, startTransition] = useTransition();

  const {productIds} = useWishlistStore();
  const wishlistCount = productIds.size;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

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

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    const params = buildBaseParams();

    if (trimmedQuery) {
      params.set("query", trimmedQuery);
    } else {
      params.delete("query");
    }

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
              onChange={(value) =>
                handleCategoryChange(
                  value === ALL_CATEGORIES_VALUE ? "" : value,
                )
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
            onChange={(event) => setQuery(event.target.value)}
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
                  Meine Wunschliste ({wishlistCount})
                </span>
              </Button>

              <span className="absolute scale-102 top-1/2 right-0 -translate-y-1/2 border-[0.2px] border-boder border-primary/35 rounded-r-md px-2 h-9 w-10 flex items-center justify-center border-l bg-background/90">
                <Heart
                  className={
                    wishlistCount > 0
                      ? "text-destructive w-4 h-4"
                      : "text-muted-foreground w-4 h-4"
                  }
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
