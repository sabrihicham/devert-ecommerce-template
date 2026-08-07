ALTER TABLE public.products_items
  ADD COLUMN IF NOT EXISTS name_fr varchar(255),
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS ingredients_fr text,
  ADD COLUMN IF NOT EXISTS usage_fr text,
  ADD COLUMN IF NOT EXISTS warnings_fr text,
  ADD COLUMN IF NOT EXISTS tags_fr text[];

ALTER TABLE public.products_variants
  ADD COLUMN IF NOT EXISTS flavor_fr varchar(100);

ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS name_fr varchar(100),
  ADD COLUMN IF NOT EXISTS description_fr text;

ALTER TABLE public.homepage_banners
  ADD COLUMN IF NOT EXISTS title_fr text,
  ADD COLUMN IF NOT EXISTS subtitle_fr text,
  ADD COLUMN IF NOT EXISTS button_label_fr text;

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS store_name_fr text,
  ADD COLUMN IF NOT EXISTS banner_text_fr text;

UPDATE public.products_items
SET name_fr = COALESCE(name_fr, name),
    description_fr = COALESCE(description_fr, description),
    ingredients_fr = COALESCE(ingredients_fr, ingredients),
    usage_fr = COALESCE(usage_fr, usage),
    warnings_fr = COALESCE(warnings_fr, warnings),
    tags_fr = COALESCE(tags_fr, tags);

UPDATE public.products_variants
SET flavor_fr = COALESCE(flavor_fr, flavor);

UPDATE public.collections
SET name_fr = COALESCE(name_fr, name),
    description_fr = COALESCE(description_fr, description);

UPDATE public.homepage_banners
SET title_fr = COALESCE(title_fr, title),
    subtitle_fr = COALESCE(subtitle_fr, subtitle),
    button_label_fr = COALESCE(button_label_fr, button_label);

UPDATE public.store_settings
SET store_name_fr = COALESCE(store_name_fr, store_name),
    banner_text_fr = COALESCE(banner_text_fr, banner_text);
