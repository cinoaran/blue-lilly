"use client";

import React, {useEffect, useState, useTransition} from "react";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";
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

  const router = useRouter();

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
    <form className="space-y-5 md:min-w-full" onSubmit={handleSearch}>
      <h4 className="text-left text-foreground">
        Wählen Sie Ihre Kategorie aus:
      </h4>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex flex-col md:flex-row items-start justify-start gap-4 w-full">
          {categoryOptions && (
            <CategorySelect
              value={categoryPath}
              onChange={(val) =>
                handleCategoryChange(val === ALL_CATEGORIES_VALUE ? "" : val)
              }
              className="w-88 md:w-auto"
              showAllOption={true}
              options={categoryOptions}
              disabled={isPending}
            />
          )}
          <div className="flex items-center justify-start gap-2 w-88 md:w-full">
            <Input
              type="search"
              placeholder="Schnellsuche Outdoor, Jacken, Schuhe, etc."
              className={`webkit-search-cancel-button:appearance-none overflow-hidden border rounded-md px-3 py-3 text-base text-foreground inset-0 border-primary/35 shadow-none data-placeholder:italic data-placeholder:text-foreground/50 ${
                isPending ? "opacity-50 pointer-events-none" : ""
              }`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              variant="default"
              type="submit"
              className="flex justify-center hover:scale-105 transition-transform"
            >
              <Search size={20} />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SearchInput;
