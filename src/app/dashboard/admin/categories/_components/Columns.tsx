"use client";

import {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox";
import {Category} from "@/types/category/category"; // Dein Type
import {Button} from "@/components/ui/button";
import {Edit2Icon, Trash2Icon} from "lucide-react";

export const columns: ColumnDef<Category>[] = [
  // 1. Selection
  {
    id: "select",
    header: ({table}) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({row}) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // 2. Name (Hauptsäule)
  {
    accessorKey: "name",
    header: () => <div className="text-left">Name</div>,
    cell: ({row}) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  // 3. Slug
  {
    accessorKey: "slug",
    header: () => <div className="text-left">Slug</div>,
    cell: ({row}) => {
      console.log("slug:", row);
      return <div className="font-mono text-sm">{row.getValue("slug")}</div>;
    },
  },
  // 4. Link (derived from `slug`)
  {
    id: "link",
    header: "Link",
    cell: ({row}) => {
      const slug = row.getValue("slug") as string | undefined;
      const href = slug ? `/category/${slug}` : "–";
      return (
        <a
          href={typeof href === "string" ? href : undefined}
          className="font-mono text-sm text-primary underline"
        >
          {href}
        </a>
      );
    },
  },
  // 6. Products Count
  {
    id: "productsCount",
    header: "Produkte",
    cell: ({row}) => (
      <div className="font-mono">{row.original._count?.products || 0}</div>
    ),
  },
  // 7. (removed attributes — not available in schema)
  // 8. Actions
  {
    id: "actions",
    cell: ({row}) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm">
          <Edit2Icon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
