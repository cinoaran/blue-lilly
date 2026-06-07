import {z} from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  smallDesc: z.string().min(1, "Small description is required"),
  longDesc: z.string().min(1, "Long description is required"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  brand: z.string().min(1, "Brand is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  slug: z.string().min(1, "Slug is required"),
  categoryId: z.string().min(1, "Category is required"),
  variants: z
    .array(
      z.object({
        id: z.string(),
        size: z.string().min(1, "Size is required"),
        units: z.string().min(1, "Unit is required"),
        options: z.array(
          z
            .object({
              id: z.string(),
              color: z.string().min(1, "Color is required"),
              sellPrice: z.number().min(1, "Sell price required"),
              entryPrice: z.number().min(1, "Entry price required"),
              taxPercentage: z.number().min(1, "Tax percentage required"),
              quantity: z.number().min(1, "Quantity required"),
              image: z
                .array(z.string())
                .min(1, "At least one image is required"),
              weight: z.number().min(1, "Weight required"),
              stockLevel: z.number().min(1, "Stock level required"),
            })
            .refine((data) => data.sellPrice > data.entryPrice, {
              message: "Sell price must be greater than entry price",
              path: ["sellPrice"],
            }),
        ),
      }),
    )
    .min(1, "At least one variant required"),
});
