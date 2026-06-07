"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {useState} from "react";
import {DataTablePagination} from "./DataTablePagination";
import {FilterColumn} from "../admin/merchant/_components/FilterColumn";
import Link from "next/link";
import {Package2Icon} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // Defensive normalization (verhindert Runtime-Fehler bei falschen Props)
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  const table = useReactTable({
    data: safeData,
    columns: safeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const headerGroups = table.getHeaderGroups?.() ?? [];
  const rows = table.getRowModel?.().rows ?? [];

  if (!Array.isArray(columns)) {
    return (
      <div className="h-24 text-center space-y-4">
        Invalid columns prop. Pass an array (z. B. getColumns()).
      </div>
    );
  }

  if (!Array.isArray(data)) {
    return (
      <div className="h-24 text-center space-y-4">
        Invalid data prop. Expected an array.
      </div>
    );
  }

  if (safeColumns.length === 0) {
    return (
      <div className="h-24 text-center space-y-4">No columns configured</div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div className="h-52 flex flex-col sm:flex-row p-10 gap-5">
        <div className="flex-1 flex flex-col items-center justify-center border border-foreground/10 rounded-md bg-secondary/50 p-4">
          <div className="text-foreground/80">No data to display</div>
          <div className="text-sm text-foreground/60">
            Try adjusting your filters or check back later.
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center border border-foreground/10 rounded-md bg-secondary/50 p-4">
          <div className="py-1.5 underlined">
            <Link
              href="/dashboard/admin/products/add-product"
              className="text-primary font-medium flex items-center gap-1"
            >
              <Package2Icon className="inline-block mr-2" /> Add a new product
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container w-full overflow-x-auto">
      <FilterColumn table={table} />
      <Table>
        <TableHeader>
          {headerGroups.map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-foreground/10 font-bold uppercase"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-foreground/10"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={Math.max(safeColumns.length, 1)}
                className="h-24 text-center space-y-4"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination table={table} />
    </div>
  );
}
