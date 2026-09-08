"use client";
import {useTransition} from "react";
import {deleteProduct} from "../actions/deleteProduct";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface ProductActionsProps {
  productId: string;
}

export function ProductActions({productId}: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Produkt und Bilder wirklich löschen?")) {
      startTransition(async () => {
        const result = await deleteProduct(productId);
        if (result.success) {
          window.location.reload(); // Oder TanStack refetch
        }
      });
    }
  };

  return (
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem className="flex flex-col gap-3">
        <Link href={`/dashboard/admin/products/${productId}`}>
          <span>Edit product</span>
        </Link>
        <Link href={`/dashboard/admin/products/add-product`}>
          <span>Add product</span>
        </Link>
        <span
          onClick={handleDelete}
          className={
            isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }
        >
          {isPending ? "Lösche..." : "Delete product"}
        </span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
