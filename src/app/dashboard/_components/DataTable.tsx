"use client";

import {Category} from "@/types/category/category";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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

import {useState, useEffect, useMemo} from "react";
import {DataTablePagination} from "./DataTablePagination";
import {FilterColumn} from "../admin/merchant/_components/FilterColumn";
import Link from "next/link";
import {Package2Icon} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data: TData[];
  // optional: pass category list so DataTable can compute columns (client-side)
  allCategories?: Category[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  allCategories,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Defensive normalization (verhindert Runtime-Fehler bei falschen Props)
  const safeColumns = useMemo(
    () => (Array.isArray(columns) ? columns : []),
    [columns],
  );
  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [tableData, setTableData] = useState<TData[]>(
    () => (safeData as TData[]) || [],
  );
  const [computedColumns, setComputedColumns] = useState<
    ColumnDef<TData, TValue>[]
  >(safeColumns as ColumnDef<TData, TValue>[]);

  // Keep tableData in sync if the `data` prop changes from outside
  useEffect(() => {
    setTableData((safeData as TData[]) || []);
  }, [data, safeData]);

  // If no columns provided, but a list of categories is passed, compute columns
  // client-side by importing the columns factory. This avoids calling client
  // functions from the server. Use computedColumns as fallback when safeColumns
  // is empty.
  const columnsToUse = (
    safeColumns.length > 0 ? safeColumns : computedColumns
  ) as ColumnDef<TData, TValue>[];
  useEffect(() => {
    let cancelled = false;
    async function compute() {
      if (safeColumns.length > 0) {
        setComputedColumns(safeColumns as ColumnDef<TData, TValue>[]);
        return;
      }
      if (!Array.isArray(allCategories)) return;
      const handlers = {
        onAdd: (parentId: string | null, created: Category) => {
          setTableData((prev) => {
            const prevCats = (prev as unknown as Category[]) || [];
            const copy =
              (JSON.parse(JSON.stringify(prevCats)) as Category[]) || [];

            function addNode(nodes: Category[]): Category[] {
              const cp = nodes.map((n) => ({
                ...n,
                children: n.children ? [...n.children] : [],
              })) as Category[];
              if (parentId === null) return [...cp, created];
              let inserted = false;
              function walk(arr: Category[]) {
                for (const node of arr) {
                  if (node.id === parentId) {
                    node.children = node.children || [];
                    node.children.push(created);
                    inserted = true;
                    return;
                  }
                  const children = node.children;
                  if (children && children.length) walk(children);
                  if (inserted) return;
                }
              }
              walk(cp);
              if (!inserted) return [...cp, created];
              return cp;
            }

            try {
              return addNode(copy) as unknown as TData[];
            } catch (_error: unknown) {
              console.log("Error adding new category to table data:", _error);
              return prev;
            }
          });
        },
        onUpdate: (id: string, updated: Partial<Category>) => {
          setTableData((prev) => {
            const prevCats = (prev as unknown as Category[]) || [];
            const copy =
              (JSON.parse(JSON.stringify(prevCats)) as Category[]) || [];

            function removeNode(
              arr: Category[],
              targetId: string,
            ): Category | null {
              for (let i = 0; i < arr.length; i++) {
                if (arr[i].id === targetId) {
                  const [removed] = arr.splice(i, 1);
                  return removed;
                }
                const children = arr[i].children;
                if (children && children.length) {
                  const removed = removeNode(children, targetId);
                  if (removed) return removed;
                }
              }
              return null;
            }

            let updatedInPlace = false;
            function walkAndUpdate(arr: Category[]) {
              for (const node of arr) {
                if (node.id === id) {
                  Object.assign(node, updated);
                  updatedInPlace = true;
                  return;
                }
                const children = node.children;
                if (children && children.length) walkAndUpdate(children);
                if (updatedInPlace) return;
              }
            }
            walkAndUpdate(copy);
            if (updatedInPlace) return copy as unknown as TData[];

            const removed = removeNode(copy, id);
            const nodeToInsert = {...(removed || {}), ...updated} as Category;
            if (!nodeToInsert) return prev;
            if (!updated.parentId) {
              copy.push(nodeToInsert);
              return copy as unknown as TData[];
            }
            let inserted = false;
            function walkInsert(arr: Category[]) {
              for (const node of arr) {
                if (node.id === updated.parentId) {
                  node.children = node.children || [];
                  node.children.push(nodeToInsert);
                  inserted = true;
                  return;
                }
                const children = node.children;
                if (children && children.length) walkInsert(children);
                if (inserted) return;
              }
            }
            walkInsert(copy);
            if (!inserted) copy.push(nodeToInsert);
            return copy as unknown as TData[];
          });
        },
        onDelete: (id: string) => {
          setTableData((prev) => {
            const prevCats = (prev as unknown as Category[]) || [];
            const copy =
              (JSON.parse(JSON.stringify(prevCats)) as Category[]) || [];

            function remove(arr: Category[], targetId: string) {
              for (let i = 0; i < arr.length; i++) {
                if (arr[i].id === targetId) {
                  arr.splice(i, 1);
                  return true;
                }
                const children = arr[i].children;
                if (children && children.length) {
                  const removed = remove(children, targetId);
                  if (removed) return true;
                }
              }
              return false;
            }

            remove(copy, id);
            return copy as unknown as TData[];
          });
        },
      };

      try {
        const mod =
          await import("@/app/dashboard/admin/categories/_components/Columns");
        if (cancelled) return;
        const cols =
          typeof mod.getColumns === "function"
            ? mod.getColumns(
                allCategories,
                handlers as unknown as {
                  onAdd?: (parentId: string | null, created: unknown) => void;
                  onUpdate?: (id: string, updated: unknown) => void;
                  onDelete?: (id: string) => void;
                },
              )
            : [];
        setComputedColumns(cols as unknown as ColumnDef<TData, TValue>[]);
      } catch (_err: unknown) {
        console.error("Error computing columns for DataTable:", _err);
        setComputedColumns([]);
      }
    }
    compute();
    return () => {
      cancelled = true;
    };
  }, [allCategories, safeColumns]);

  const table = useReactTable({
    data: tableData,
    columns: computedColumns,
    getSubRows: (row: TData) => {
      // If TData happens to include a `children` property, return it as TData[]
      const maybe = row as unknown as {children?: unknown};
      return (maybe.children as unknown as TData[]) ?? undefined;
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
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
      expanded,
    },
    onExpandedChange: (updater) => {
      // Bridge TanStack updater to React setState
      // `updater` may be a function or a value. Ensure we always pass a
      // Record<string, boolean> back to setExpanded to satisfy TS types.
      setExpanded((prev) => {
        if (typeof updater === "function") {
          const fn = updater as (
            old: Record<string, boolean>,
          ) => Record<string, boolean>;
          const next = fn(prev);
          return next ?? prev;
        }
        return (updater as Record<string, boolean>) ?? prev;
      });
    },
  });

  const headerGroups = table.getHeaderGroups?.() ?? [];
  const rows = table.getRowModel?.().rows ?? [];

  if (!Array.isArray(columnsToUse)) {
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

  // If no columns supplied via props and we're computing them from
  // `allCategories`, show a loading placeholder while the dynamic
  // import computes `computedColumns`.
  if (columnsToUse.length === 0) {
    if (safeColumns.length === 0 && Array.isArray(allCategories)) {
      return <div className="h-24 text-center space-y-4">Loading columns…</div>;
    }

    return (
      <div className="h-24 text-center space-y-4">No columns configured</div>
    );
  }

  if (tableData.length === 0) {
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
                colSpan={Math.max(columnsToUse.length, 1)}
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
