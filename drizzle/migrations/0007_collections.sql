-- ========================================
-- MANAGEABLE COLLECTIONS (replaces fixed product_category enum)
-- ========================================
-- Adds a `collections` table so admins can add/edit/delete product
-- collections (categories) instead of relying on a fixed enum, then
-- migrates `products_items.category` to reference `collections.slug`.

CREATE TABLE IF NOT EXISTS public.collections (
  id bigserial PRIMARY KEY,
  name varchar(100) NOT NULL,
  slug varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collections_slug_unique UNIQUE (slug)
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view collections" ON public.collections;
DROP POLICY IF EXISTS "Backend can manage collections" ON public.collections;

CREATE POLICY "Anyone can view collections"
  ON public.collections
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Backend can manage collections"
  ON public.collections
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (current_setting('request.jwt.claim.role', true) IS NULL)
  WITH CHECK (current_setting('request.jwt.claim.role', true) IS NULL);

-- Seed the collections table with the existing fixed categories.
INSERT INTO public.collections (name, slug)
VALUES
  ('T-Shirts', 't-shirts'),
  ('Pants', 'pants'),
  ('Sweatshirts', 'sweatshirts')
ON CONFLICT (slug) DO NOTHING;

-- Migrate products_items.category from the product_category enum to a
-- plain varchar referencing collections(slug).
ALTER TABLE public.products_items
  ALTER COLUMN category TYPE varchar(100) USING category::text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_items_category_collections_slug_fk'
  ) THEN
    ALTER TABLE public.products_items
      ADD CONSTRAINT products_items_category_collections_slug_fk
      FOREIGN KEY (category) REFERENCES public.collections(slug)
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- The fixed enum type is no longer used by any column, safe to drop.
DROP TYPE IF EXISTS product_category;
