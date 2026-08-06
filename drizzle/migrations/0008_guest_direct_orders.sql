-- Allow cash-on-delivery orders placed by guests while keeping the existing
-- optional relationship to a registered customer.
ALTER TABLE public.order_items
  ALTER COLUMN user_id DROP NOT NULL;

-- Guest orders are intentionally not readable through RLS. They are exposed
-- only by the application after a server-side order reference check.
