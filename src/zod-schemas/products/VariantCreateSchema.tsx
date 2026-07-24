import {z} from "zod";

export const VariantCreateSchema = z.object({
  productId: z.string(),
  size: z.string(),
  international: z.string(),
  options: z.array(
    z
      .object({
        baseColor: z.string().optional(),
        displayColor: z.string().optional(),
        entryPrice: z.string().min(1, "Entry Price is required"),
        sellPrice: z.string().min(1, "Sell Price is required"),
        quantity: z.string().min(1, "Quantity is required"),
        url: z.string().min(1, "URL is required"),
        image: z.array(z.string()).min(1, "At least one image is required"),
        weight: z.string().min(1, "Weight is required"),
        // stockLevel removed
      })
      .refine(
        (data) => {
          const hasBase =
            typeof data.baseColor === "string" &&
            data.baseColor.trim().length > 0;
          const hasDisplay =
            typeof data.displayColor === "string" &&
            data.displayColor.trim().length > 0;
          return hasBase || hasDisplay;
        },
        {message: "Either baseColor or displayColor is required"},
      ),
  ),
});
