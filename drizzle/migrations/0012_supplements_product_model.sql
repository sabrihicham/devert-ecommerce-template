-- Replace the clothing-oriented product options with supplement attributes.
DO $$ BEGIN
  CREATE TYPE supplement_form AS ENUM ('powder','capsules','tablets','liquid','gummies','bars','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE quantity_unit AS ENUM ('g','kg','ml','capsule','tablet','serving','piece');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.products_items
  ADD COLUMN IF NOT EXISTS brand varchar(150) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ingredients text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS usage text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS warnings text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT ARRAY[]::text[];

ALTER TABLE public.products_variants
  ADD COLUMN IF NOT EXISTS flavor varchar(100),
  ADD COLUMN IF NOT EXISTS form supplement_form NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS quantity numeric(10,2),
  ADD COLUMN IF NOT EXISTS quantity_unit quantity_unit NOT NULL DEFAULT 'piece',
  ADD COLUMN IF NOT EXISTS servings integer,
  ADD COLUMN IF NOT EXISTS sku varchar(100),
  ADD COLUMN IF NOT EXISTS price numeric(10,2),
  ADD COLUMN IF NOT EXISTS compare_at_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

UPDATE public.products_variants
SET flavor = COALESCE(NULLIF(color, ''), 'بدون نكهة'),
    quantity = 1,
    sku = COALESCE(NULLIF(sku, ''), 'LEGACY-' || id::text),
    price = (SELECT price FROM public.products_items p WHERE p.id = product_id),
    stock = (SELECT stock FROM public.products_items p WHERE p.id = product_id)
WHERE flavor IS NULL OR quantity IS NULL OR sku IS NULL OR price IS NULL;

ALTER TABLE public.products_variants
  ALTER COLUMN flavor SET NOT NULL,
  ALTER COLUMN quantity SET NOT NULL,
  ALTER COLUMN sku SET NOT NULL,
  ALTER COLUMN price SET NOT NULL;

ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_user_variant_size_unique;
DROP INDEX IF EXISTS idx_cart_user_variant_size;
ALTER TABLE public.cart_items DROP COLUMN IF EXISTS size;
ALTER TABLE public.cart_items ADD CONSTRAINT cart_user_variant_unique UNIQUE (user_id, variant_id);

ALTER TABLE public.order_products ADD COLUMN IF NOT EXISTS variant_snapshot jsonb;
UPDATE public.order_products op
SET variant_snapshot = jsonb_build_object(
  'sku', v.sku, 'flavor', v.flavor, 'form', v.form::text,
  'quantity', v.quantity, 'quantityUnit', v.quantity_unit::text, 'price', v.price
)
FROM public.products_variants v
WHERE v.id = op.variant_id AND op.variant_snapshot IS NULL;
ALTER TABLE public.order_products ALTER COLUMN variant_snapshot SET NOT NULL;
ALTER TABLE public.order_products DROP COLUMN IF EXISTS size;

ALTER TABLE public.products_variants DROP CONSTRAINT IF EXISTS product_color_unique;
ALTER TABLE public.products_variants DROP COLUMN IF EXISTS color;
ALTER TABLE public.products_variants DROP COLUMN IF EXISTS sizes;
ALTER TABLE public.products_variants ADD CONSTRAINT product_variant_sku_unique UNIQUE (sku);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.products_variants (sku);
CREATE INDEX IF NOT EXISTS idx_variants_active_stock ON public.products_variants (is_active, stock);
