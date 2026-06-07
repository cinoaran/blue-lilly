import type {Variant} from "@/types/product/variants";

// FormData nutzt die zentrale Variant- und Option-Definition
export type ProductFormData = {
  id: string;
  merchantId: string;
  name: string;
  smallDesc: string;
  longDesc: string;
  isActive: boolean;
  isFeatured: boolean;
  brand: string;
  categoryId: string;
  subcategory: string;
  slug: string;
  variants: Variant[];
  sku?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Merchant = {
  id: string;
  name: string;
};

export type Unit = {
  id: string;
  name: string;
  code: string;
};
