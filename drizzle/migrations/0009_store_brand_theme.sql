ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS brand_theme text NOT NULL DEFAULT 'performance';

ALTER TABLE public.store_settings
  DROP CONSTRAINT IF EXISTS store_settings_brand_theme_check;

ALTER TABLE public.store_settings
  ADD CONSTRAINT store_settings_brand_theme_check
  CHECK (brand_theme IN ('performance', 'endurance', 'energy'));
