"use client";

import Image from "next/image";
import {ColumnDef} from "@tanstack/react-table";
import {MoreHorizontal} from "lucide-react";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Checkbox} from "@/components/ui/checkbox";

import React from "react";

export type Product = {
  id: string;
  name: string;
  brand?: string | null;
  slug?: string | null;
  isActive?: boolean;
  rating?: number | string;
  // firstOptionImage will be provided from server data mapping
  firstOptionImage?: string | null;
  // quantities per variant and total
  variantQuantities?: number[][];
  totalQuantity?: number;
  // minimum quantity per variant and overall minimum
  variantMins?: number[];
  minAcrossVariants?: number | null;
  category?: {name?: string} | null;
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({table}) => (
      <div className="flex items-center justify-center aspect-square h-10">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({row}) => (
      <div className="flex items-center justify-center aspect-square h-10">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "image_col",
    header: "",
    cell: ({row}) => {
      const url = row.original.firstOptionImage;
      return url ? (
        <div className="flex items-center justify-center">
          <Image
            src={url}
            alt={row.original.name}
            width={80}
            height={48}
            className="object-cover rounded"
          />
        </div>
      ) : (
        <div className="text-muted-foreground">-</div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({row}) => <div className="truncate">{row.original.name}</div>,
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({row}) => (
      <div className="truncate">{row.original?.brand ?? "-"}</div>
    ),
  },
  {
    id: "category_col",
    header: "Category",
    cell: ({row}) => <div>{row.original.category?.name ?? "-"}</div>,
  },
  {
    id: "quantity_col",
    accessorKey: "minAcrossVariants",
    header: ({table, column}) => (
      <QuantityHeader table={table} column={column} />
    ),
    cell: ({row}) => <QuantityCell row={row} />,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === "lt5") {
        const v = row.getValue(columnId) as unknown;
        return typeof v === "number" && v < 5;
      }
      return true;
    },
  },
  // createdAt column removed per request
  {
    id: "actions_col",
    header: "",
    cell: ({row}) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <ProductActions productId={row.original.id} />
      </DropdownMenu>
    ),
  },
];

import {Table, Column} from "@tanstack/react-table";

function QuantityHeader({
  table,
  column,
}: {
  table: Table<Product>;
  column: Column<Product, unknown>;
}) {
  const isFiltered = column.getFilterValue() === "lt5";
  const toggle = () => {
    if (isFiltered) {
      table.setColumnFilters((old: {id: string; value: unknown}[]) =>
        old.filter((f) => f.id !== column.id),
      );
    } else {
      table.setColumnFilters([{id: column.id, value: "lt5"}]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span>Qty</span>
      <button
        type="button"
        onClick={toggle}
        title={
          isFiltered ? "Showing products with QTY < 5" : "Showing all products"
        }
        className="flex items-start justify-start w-max p-1 bg-transparent"
      >
        <span
          className={`inline-block w-3 h-3 rounded-full ${isFiltered ? "bg-red-600" : "bg-green-500"}`}
        />
      </button>
    </div>
  );
}

import type {Row} from "@tanstack/react-table";
import {ProductActions} from "./ProductActions";

function QuantityCell({row}: {row: Row<Product>}) {
  const total = row.original.totalQuantity ?? 0;
  const mins = row.original.variantMins ?? [];
  const minAcross = row.original.minAcrossVariants ?? null;
  if ((mins.length === 0 || mins.every((m: number) => m === 0)) && total === 0)
    return <div>-</div>;
  const low = minAcross != null && minAcross < 5;
  const breakdown = mins
    .map((m: number, i: number) => `v${i + 1}:${m}`)
    .join(" | ");

  const color = low ? "bg-red-600" : "bg-green-500";

  return (
    <div title={breakdown} className="flex items-center">
      <span
        aria-hidden="true"
        className={`inline-block w-3 h-3 rounded-full ${color} ${low ? "animate-pulse" : ""}`}
      />
    </div>
  );
}
