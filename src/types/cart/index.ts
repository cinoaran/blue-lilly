import type {Option} from "@/types/product/options";

// Extend the frontend Option with the optional nested relation shapes
// returned by Prisma when including variant -> product.
export interface CartItem {
  id: string;
  cartId: string;
  optionId: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
  // option may include nested relation data when fetched from the backend
  option?:
    | (Option & {
        variant?: {
          product?: {
            id?: string;
            name?: string;
            price?: number;
            sku?: string | null;
          } | null;
        } | null;
      })
    | null;
}

export interface CartWithItems {
  id: string;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
}
