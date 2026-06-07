"use client";

import type {ColumnDef} from "@tanstack/react-table";
import {ArrowUpDown, MoreHorizontal} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {Checkbox} from "@/components/ui/checkbox";
import Link from "next/link";

export type Merchant = {
  id: string;
  name: string | null;
  email: string | null;
};

export const columns: ColumnDef<Merchant>[] = [
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
    accessorKey: "name",
    header: ({column}) => (
      <p className="flex items-center gap-2">
        Merchant
        <ArrowUpDown
          className="ml-2 h-4 w-4 cursor-pointer hover:scale-75"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      </p>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    cell: ({row}) => {
      const merchant = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-white">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(merchant.id)}
            >
              Copy merchant ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`admin/merchant/${merchant.id}`}>
                <span>Update merchant</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
