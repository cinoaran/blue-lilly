// Add Merchant Schema
import {z} from "zod";
export const MerchantSchema = z.object({
  name: z.string().min(3, "Merchant name is required"),
  address: z.string().min(3, "Address is required"),
  web: z
    .url("Invalid URL")
    .refine(
      (val) => /^https?:\/\/([\w-]+\.)+[\w-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(val),
      {
        message:
          "URL must have a second-level domain and a valid TLD (e.g., example.com)",
      }
    ),

  phone: z.string().min(3, "Phone number is required"),
  email: z.email("Invalid email address"),
  partners: z
    .array(
      z.object({
        name: z.string().min(3, "Partner name is required"),
        phone: z.string().min(3, "Partner phone number is required"),
        email: z.email("Invalid partner email address"),
        department: z.string().min(3, "Department is required"),
      })
    )
    .min(1, "At least one partner is required"),
});
