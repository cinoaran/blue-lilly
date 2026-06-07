import {z} from "zod";

export const OptionSchema = z.object({
  quantity: z.number().min(1, {message: "Quantity must be at least 1 digit"}),
  entryPrice: z.number().min(1, {message: "Entry price must be at least 1"}),
  sellPrice: z.number().min(1, {message: "Sell price must be at least 1"}),
  taxPercentage: z
    .number()
    .min(1, {message: "Tax percentage must be at least 1"}),
  image: z.array(z.instanceof(File)).optional(),
  color: z.string().min(2, {message: "Color must have at least 2 characters"}),
  weight: z.number().min(1, {message: "Weight must be at least 1"}),
  stockLevel: z.number().min(1, {message: "Stock level must be at least 1"}),
  // weitere optionale Felder...
});

export const VariantSchema = z.object({
  size: z.string().min(1, {message: "Size is required"}),
  unitId: z.string().min(1, {message: "Unit is required"}),
  options: z.array(OptionSchema),
});

export const ProductEditSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z
    .string()
    .min(3, {message: "Product name must have at least 3 characters"}),
  description: z
    .string()
    .min(10, {message: "Description must have at least 10 characters"}),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  brand: z.string().min(2, {message: "Brand must have at least 2 characters"}),
  subcategory: z
    .string()
    .min(2, {message: "Subcategory must have at least 2 characters"}),
  slug: z.string().min(3, {message: "Slug must have at least 3 characters"}),
  categoryId: z.string().min(1, {message: "Category is required"}),

  variants: z.array(VariantSchema),
});

export const ProductSchema = z.object({
  merchantId: z.string().min(1, "Merchant is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  brand: z.string().min(1, "Brand is required"),
  subcategory: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  categoryId: z.string().min(1, "Category is required"),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.string().optional(),
        units: z.string().min(1, "Unit is required"),
        options: z.array(
          z
            .object({
              id: z.string().optional(),
              color: z.string().min(1, "Color is required"),
              sellPrice: z.number().min(0, "Sell price required"),
              entryPrice: z.number().min(0, "Entry price required"),
              taxPercentage: z.number().min(0, "Tax percentage required"),
              quantity: z.number().min(0, "Quantity required"),
              image: z
                .array(z.union([z.string(), z.instanceof(File)]))
                .min(1, {message: "At least one image is required"}), // File[] und string[]
              weight: z.number().min(0, "Weight required"),
              stockLevel: z.number().min(0).optional(),
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

/* 
http://localhost:3000/uploadthings/products/cmf21avfw0000i0oo6mnw9i7y/new-balance-u-440-v2-skateboardschuhe/46/red/abcd1234.webp

  id: 'cmf21avfw0000i0oo6mnw9i7y',
{
  brand: "New Balance", 
  categoryId: "cm8msrowk0000i0dkfdo2t4ab", 
  description: "New Balance U 440 v2 Skateboardschuhe",  
  isActive: true,
  isFeatured: false,
  merchantId: "cmk7yenp00000i0q4pz5ecdau"
  name: "New Balance"
  slug: "new-balance-u-440-v2-skateboardschuhe",  
  subcategory: "Men Women",
  rating: 4.5,
  numReviews: 10, 
  variants: [
    {
     size: "46"
     unitId: "cmkv7q2y40000i0dwa9fwq5nf"  
     options: [
        {
          color: "red",
          entryPrice: "129.88",
          image: ['https://utfs.io/f/G7eb7qdCR5PMoJTVKcRLrJduA1GtmovVzlUkP749e6c0XZCa', 'https://utfs.io/f/G7eb7qdCR5PMFgJJYl9Z8UaTjM269to04hONGXWuHswcxKld', 'https://utfs.io/f/G7eb7qdCR5PMasHevBOqrVJZlgfpN0W5cMFULbHTzawkCoOs'],
            quantity: 100,
          sellPrice: 149.99,
          stockLevel: 50,
          sku: "newbalance-u440v2-red-46",
          taxPercentage: 19,
          weight: 800,
        },{
          color: "orange",
          entryPrice: "429.88",
          image: ['https://utfs.io/f/G7eb7qdCR5PMoJTVKcRLrJduA1GtmovVzlUkP749e6c0XZCa', 'https://utfs.io/f/G7eb7qdCR5PMFgJJYl9Z8UaTjM269to04hONGXWuHswcxKld', 'https://utfs.io/f/G7eb7qdCR5PMasHevBOqrVJZlgfpN0W5cMFULbHTzawkCoOs'], ],
          quantity: 5,
          sellPrice: 749.99,
          stockLevel: 9,
          sku: "newbalance-u440v2-orange-46",
          taxPercentage: 19,
          weight: 20,
        }
      ]
    },
    {
     size: "42"
     unitId: "sffg7q2y40000i0dwa9fwq5nf"  
     options: [
        {
          color: "red",
          entryPrice: "36.88",
          image: ['https://utfs.io/f/G7eb7qdCR5PMoJTVKcRLrJduA1GtmovVzlUkP749e6c0XZCa', 'https://utfs.io/f/G7eb7qdCR5PMFgJJYl9Z8UaTjM269to04hONGXWuHswcxKld', 'https://utfs.io/f/G7eb7qdCR5PMasHevBOqrVJZlgfpN0W5cMFULbHTzawkCoOs'],
          quantity: 22,
          sellPrice: 59.99,
          stockLevel: 10,
          sku: "newbalance-u440v2-red-42",
          taxPercentage: 19,
          weight: 10,
        }
      ]
    },
  ]
} */
