import { z } from "zod";

import { WILAYA_CODES } from "@/constants/wilayas";

export const CheckoutFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .min(9, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  line1: z.string().trim().min(1, "Address is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  wilaya: z.enum(WILAYA_CODES, {
    message: "Select a wilaya",
  }),
});

export type CheckoutFormInput = z.infer<typeof CheckoutFormSchema>;

export const CreateOrderSchema = CheckoutFormSchema.extend({
  cartItemIds: z.array(z.number().int().positive()).min(1, "Cart is empty"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
