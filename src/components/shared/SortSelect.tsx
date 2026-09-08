"use client";
import React from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

const DEFAULT_SORT_VALUE = "__default_sort__";

export default function SortSelect({defaultValue}: {defaultValue?: string}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams?.get("sort") ?? defaultValue ?? "";
  const selectedValue = current || DEFAULT_SORT_VALUE;
  /* const searchFieldClassName =
    "h-22 min-w-45 border-[0.3px] border-border bg-background px-3 py-4 text-base text-foreground ring-1 ring-inset ring-primary shadow-none data-[placeholder]:italic data-[placeholder]:text-foreground/50";
 */
  const onValueChange = (val: string) => {
    if (val === selectedValue) return;

    const params = new URLSearchParams(
      Array.from(searchParams?.entries() ?? []),
    );

    if (val === DEFAULT_SORT_VALUE || !val) {
      params.delete("sort");
    } else {
      params.set("sort", val);
    }

    params.set("page", "1");
    const nextUrl = `${pathname}?${params.toString()}`;

    // Use a deterministic full navigation to avoid intermittent client-side transition races.
    window.location.replace(nextUrl);
  };

  return (
    <div className="flex items-center justify-center gap-2 w-full">
      <Select
        key={selectedValue}
        defaultValue={selectedValue}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          size="default"
          className="mt-0 md:mt-12 w-46 font-normal text-sm"
        >
          <SelectValue placeholder="Filtern (nach)" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={DEFAULT_SORT_VALUE}>Filtern (nach)</SelectItem>
          <SelectItem value="createdAt.desc">Newest</SelectItem>
          <SelectItem value="createdAt.asc">Oldest</SelectItem>
          <SelectItem value="name.asc">Name A→Z</SelectItem>
          <SelectItem value="name.desc">Name Z→A</SelectItem>
          <SelectItem value="price.asc">Price: Low to High</SelectItem>
          <SelectItem value="price.desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
