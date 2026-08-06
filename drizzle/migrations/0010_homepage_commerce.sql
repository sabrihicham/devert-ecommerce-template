-- Storefront merchandising fields. Existing products remain publicly visible.
CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE banner_placement AS ENUM ('hero', 'promo_primary', 'promo_secondary', 'limited_offer');

ALTER TABLE public.products_items
  ADD COLUMN compare_at_price numeric(10,2),
  ADD COLUMN stock integer NOT NULL DEFAULT 0,
  ADD COLUMN status product_status NOT NULL DEFAULT 'published',
  ADD COLUMN is_best_seller boolean NOT NULL DEFAULT false,
  ADD COLUMN is_new_arrival boolean NOT NULL DEFAULT false,
  ADD COLUMN published_at timestamptz;
UPDATE public.products_items SET published_at = created_at WHERE published_at IS NULL;
ALTER TABLE public.products_items
  ADD CONSTRAINT stock_nonnegative CHECK (stock >= 0),
  ADD CONSTRAINT compare_at_price_valid CHECK (compare_at_price IS NULL OR compare_at_price >= price);
CREATE INDEX idx_products_storefront ON public.products_items (status, is_featured, created_at DESC);
CREATE INDEX idx_products_best_sellers ON public.products_items (status, is_best_seller, created_at DESC);

ALTER TABLE public.collections
  ADD COLUMN image_url text,
  ADD COLUMN mobile_image_url text,
  ADD COLUMN description text,
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN display_order integer NOT NULL DEFAULT 0;
CREATE INDEX idx_collections_visible_order ON public.collections (is_visible, display_order);

ALTER TABLE public.homepage_banners
  ADD COLUMN mobile_image_url text,
  ADD COLUMN button_label text,
  ADD COLUMN placement banner_placement NOT NULL DEFAULT 'hero',
  ADD COLUMN product_id bigint REFERENCES public.products_items(id) ON DELETE SET NULL,
  ADD COLUMN starts_at timestamptz,
  ADD COLUMN ends_at timestamptz;
CREATE INDEX idx_homepage_banners_placement_active ON public.homepage_banners (placement, is_active, sort_order);

CREATE TABLE public.testimonials (
  id bigserial PRIMARY KEY, name text NOT NULL, content text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5), avatar_url text,
  product_id bigint REFERENCES public.products_items(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false, display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_testimonials_published_order ON public.testimonials (is_published, display_order);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published testimonials" ON public.testimonials FOR SELECT TO public USING (is_published);
CREATE POLICY "Backend can manage testimonials" ON public.testimonials FOR ALL TO public USING (current_setting('request.jwt.claim.role', true) IS NULL) WITH CHECK (current_setting('request.jwt.claim.role', true) IS NULL);

CREATE TABLE public.newsletter_subscribers (
  id bigserial PRIMARY KEY, email text NOT NULL UNIQUE, status text NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed','unsubscribed')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Backend can manage newsletter subscribers" ON public.newsletter_subscribers FOR ALL TO public USING (current_setting('request.jwt.claim.role', true) IS NULL) WITH CHECK (current_setting('request.jwt.claim.role', true) IS NULL);

CREATE TABLE public.recently_viewed_products (
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES public.products_items(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, product_id)
);
CREATE INDEX idx_recently_viewed_user_date ON public.recently_viewed_products (user_id, viewed_at DESC);
ALTER TABLE public.recently_viewed_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own viewing history" ON public.recently_viewed_products FOR ALL TO public USING (app.current_user_id() = user_id) WITH CHECK (app.current_user_id() = user_id);
