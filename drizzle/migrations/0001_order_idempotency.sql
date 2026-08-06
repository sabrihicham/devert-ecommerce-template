DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_info_stripe_order_id_unique'
  ) THEN
    ALTER TABLE "customer_info"
    ADD CONSTRAINT "customer_info_stripe_order_id_unique"
    UNIQUE ("stripe_order_id");
  END IF;
END $$;
