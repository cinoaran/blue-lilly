import type {ProductFormData} from "@/types/product/productFormData";
import type {ProductBase} from "@/types/product/product";
import type {Option} from "@/types/product/options";
import type {Variant} from "@/types/product/variants";

export default function mapPrismaProductToFormData(
  product: ProductBase,
): ProductFormData {
  return {
    id: product.id,
    merchantId: product.merchantId,
    name: product.name,
    smallDesc: product.smallDesc ?? "",
    longDesc: product.longDesc ?? "",
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    brand: product.brand,
    categoryId: product.categoryId,
    subcategory: product.subcategory ?? "",
    slug: product.slug,
    variants: product.variants.map((variant: Variant) => ({
      id: variant.id ?? "",
      size: variant.size,
      units: variant.units,
      options: variant.options.map((option: Option) => {
        const typed = option as Option & {
          color?: string;
          displayColor?: string;
        };
        return {
          id: option.id ?? "",
          entryPrice: Number(option.entryPrice),
          sellPrice: Number(option.sellPrice),
          taxPercentage: Number(option.taxPercentage),
          quantity: option.quantity,
          image: option.image,
          baseColor: typed.baseColor ?? "",
          displayColor: typed.displayColor ?? "",
          weight: Number(option.weight),
          sku: option.sku ?? "",
        };
      }),
    })),
  };
}
