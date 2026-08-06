-- ========================================
-- STORE SETTINGS (singleton table)
-- ========================================
-- Adds a single-row `store_settings` table for store identity (name, contact
-- phone, WhatsApp number, address), a homepage announcement banner, and
-- (storage-only, not yet enforced) order rules. Row is pinned to id = 1.

CREATE TABLE IF NOT EXISTS public.store_settings (
  id integer PRIMARY KEY DEFAULT 1,
  store_name text NOT NULL,
  store_phone text NOT NULL,
  whatsapp_number text,
  address_line1 text,
  address_city text,
  address_wilaya text,
  banner_text text,
  banner_active boolean NOT NULL DEFAULT false,
  min_order_amount_cents integer,
  max_pending_orders_per_phone integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_settings_single_row CHECK (id = 1)
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Backend can manage store settings" ON public.store_settings;

CREATE POLICY "Public can read store settings"
  ON public.store_settings
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Backend can manage store settings"
  ON public.store_settings
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (current_setting('request.jwt.claim.role', true) IS NULL)
  WITH CHECK (current_setting('request.jwt.claim.role', true) IS NULL);

INSERT INTO public.store_settings (id, store_name, store_phone)
VALUES (1, 'My Store', '0000000000')
ON CONFLICT (id) DO NOTHING;
