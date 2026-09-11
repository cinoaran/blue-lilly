import {Variant} from "@/types/product/variants";

export interface ProductBase {
  variants: Variant[];
  id: string;
  merchantId: string;
  name: string;
  smallDesc: string;
  longDesc: string;
  isActive: boolean;
  isFeatured: boolean;
  brand: string;
  categoryId: string;
  subcategory: string | null;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
  rating?: number;
  numReviews?: number;
}

export interface ProductWithVariants extends ProductBase {
  variants: Variant[];
}
export interface ProductWithCategoryAndVariants extends ProductBase {
  category: {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
  };
  variants: Variant[];
}
