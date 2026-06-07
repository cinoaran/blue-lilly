"use client";
import React, {useEffect} from "react";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableLike {
  getPreFilteredRowModel(): {rows: Array<{original?: {brand?: string}}>};
  getColumn(
    id: string,
  ): {getFilterValue(): unknown; setFilterValue(v: unknown): void} | undefined;
}

interface ProductFilterProps {
  table: TableLike;
}

export function FilterColumn({table}: ProductFilterProps) {
  // ...existing code...
  const brands = Array.from(
    new Set(
      table
        .getPreFilteredRowModel()
        .rows.map((r) => r.original?.brand)
        .filter(Boolean),
    ),
  );

  // ensure "All Brands" selected by default when no filter is set
  useEffect(() => {
    const col = table.getColumn("brand");
    if (
      col &&
      (col.getFilterValue() === undefined || col.getFilterValue() === null)
    ) {
      // leave as undefined (no filter) instead of empty string
      col.setFilterValue(undefined);
    }
  }, [table]);

  // Use a sentinel value for "All" because SelectItem values must be non-empty.
  const filterVal = table.getColumn("brand")?.getFilterValue() as
    | string
    | undefined;
  const selectedBrand = filterVal ?? "__all__";

  return (
    <div className="flex flex-col items-center justify-center md:flex-row md:justify-between w-full py-4 mb-5 text-primary-foreground gap-8 md:gap-4 overflow-x-auto">
      <Input
        placeholder="Filter name..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) => {
          const v = event.target.value;
          table.getColumn("name")?.setFilterValue(v);
        }}
        className="w-full md:w-1/2 border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.9rem]"
      />

      <Select
        value={selectedBrand}
        onValueChange={(value) =>
          // "__all__" -> clear filter (All Brands)
          table
            .getColumn("brand")
            ?.setFilterValue(value === "__all__" ? undefined : value)
        }
      >
        <SelectTrigger className="w-full md:w-1/3 border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.9rem]">
          <SelectValue placeholder="Select a brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Brands</SelectLabel>
            {/* All Brands option uses sentinel value (non-empty) */}
            <SelectItem value="__all__">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b as string} value={b as string}>
                {b as string}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
