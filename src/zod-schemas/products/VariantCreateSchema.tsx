import {z} from "zod";

export const VariantCreateSchema = z.object({
  productId: z.string(),
  size: z.string(),
  international: z.string(),
  options: z.array(
    z.object({
      color: z.string().min(1, "Color is required"),
      entryPrice: z.string().min(1, "Entry Price is required"),
      sellPrice: z.string().min(1, "Sell Price is required"),
      quantity: z.string().min(1, "Quantity is required"),
      url: z.string().min(1, "URL is required"),
      image: z.array(z.string()).min(1, "At least one image is required"),
      weight: z.string().min(1, "Weight is required"),
      stockLevel: z.string().min(1, "Stock Level is required"),
    }),
  ),
});
