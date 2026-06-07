"use client";

import {ColumnDef} from "@tanstack/react-table";
import {ArrowUpDown, MoreHorizontal, User, UserLock} from "lucide-react";
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
import ImpersonateUser from "./ImpersonateUser";
import VerifyUserEmailUser from "./VerifyUserEmail";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
};

export const columns: ColumnDef<User>[] = [
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
    header: ({column}) => {
      return (
        <p className="flex items-center gap-2">
          Name
          <ArrowUpDown
            className="ml-2 h-4 w-4 cursor-pointer hover:scale-75"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </p>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "emailVerified",
    header: "Login",
    cell: ({row}) => {
      const user = row.original;
      return (
        <div className="flex items-center justify-center max-w-10">
          <VerifyUserEmailUser
            userId={user.id}
            emailVerified={user.emailVerified}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({row}) => {
      const role =
        row.original.role === "admin" ? (
          <UserLock className="text-primary" />
        ) : (
          <User />
        );
      return (
        <div className="flex items-center justify-center max-w-8">{role}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({row}) => {
      const user = row.original;
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
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {
                <Link href={`admin/${user.id}`}>
                  <span>Update user</span>
                </Link>
              }
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ImpersonateUser userId={user.id} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
