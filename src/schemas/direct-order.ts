import { z } from "zod";

import { CheckoutFormSchema } from "./checkout";
import { ProductSizeZod } from "@/lib/db/drizzle/schema";

export const DirectOrderSchema = CheckoutFormSchema.extend({
  variantId: z.number().int().positive(),
  size: ProductSizeZod,
  orderRef: z.string().uuid(),
});

export type DirectOrderInput = z.infer<typeof DirectOrderSchema>;
