import {z} from "zod";

export const addressSchema = z.object({
  firstName: z.string().min(1, "Vorname erforderlich"),
  lastName: z.string().min(1, "Nachname erforderlich"),
  street: z.string().min(1, "Straße erforderlich"),
  houseNumber: z.string().min(1, "Hausnummer erforderlich"),
  postalCode: z.string().min(1, "PLZ erforderlich"),
  city: z.string().min(1, "Ort erforderlich"),
  country: z.string().min(1, "Land erforderlich"),
  company: z.string().optional(),
  phone: z.string().optional(),
});

export const checkoutSchema = z
  .object({
    billingAddress: addressSchema,
    shippingSameAsBilling: z.boolean(),
    shippingAddress: addressSchema,
  })
  .refine((data) => data.shippingSameAsBilling || !!data.shippingAddress, {
    message: "Lieferadresse ist erforderlich",
    path: ["shippingAddress"],
  });

export type Address = z.infer<typeof addressSchema>;
export type CheckoutAddresses = z.infer<typeof checkoutSchema>;
