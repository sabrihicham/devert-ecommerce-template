-- ========================================
-- HOMEPAGE BANNERS + FEATURED PRODUCTS
-- ========================================
-- Adds a `homepage_banners` table so admins can manage multiple animated
-- hero-slider slides (image, title, subtitle, link, order, active flag),
-- and an `is_featured` flag on products so admins can curate a "Featured
-- Products" section on the homepage.

CREATE TABLE IF NOT EXISTS public.homepage_banners (
  id bigserial PRIMARY KEY,
  image_url text NOT NULL,
  title text,
  subtitle text,
  link_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_homepage_banners_sort_order
  ON public.homepage_banners (sort_order);
CREATE INDEX IF NOT EXISTS idx_homepage_banners_is_active
  ON public.homepage_banners (is_active);

ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active homepage banners" ON public.homepage_banners;
DROP POLICY IF EXISTS "Backend can manage homepage banners" ON public.homepage_banners;

CREATE POLICY "Anyone can view active homepage banners"
  ON public.homepage_banners
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Backend can manage homepage banners"
  ON public.homepage_banners
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (current_setting('request.jwt.claim.role', true) IS NULL)
  WITH CHECK (current_setting('request.jwt.claim.role', true) IS NULL);

ALTER TABLE public.products_items
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_is_featured
  ON public.products_items (is_featured);
