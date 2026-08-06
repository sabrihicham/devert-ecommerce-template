import { z } from "zod";

import { CheckoutFormSchema } from "./checkout";

export const DirectOrderSchema = CheckoutFormSchema.extend({
  variantId: z.number().int().positive(),
  orderRef: z.string().uuid(),
});

export type DirectOrderInput = z.infer<typeof DirectOrderSchema>;
