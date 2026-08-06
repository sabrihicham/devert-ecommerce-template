-- ========================================
-- ADMIN ROLES + ORDER STATUS LIFECYCLE
-- ========================================
-- Adds a `role` column to the `user` table (replaces relying solely on the
-- ADMIN_EMAIL env var for admin authorization) and a `status` column to
-- `order_items` so the admin dashboard can manage the COD order lifecycle
-- (pending -> confirmed -> out_for_delivery -> delivered, or cancelled/no_answer/returned).

DO $$
BEGIN
  -- ---------- user_role enum + user.role ----------
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'role'
    ) THEN
      ALTER TABLE public."user" ADD COLUMN role public.user_role NOT NULL DEFAULT 'customer';
    END IF;

    CREATE INDEX IF NOT EXISTS idx_user_role ON public."user" (role);
  END IF;

  -- ---------- order_status enum + order_items.status ----------
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending',
      'confirmed',
      'no_answer',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'status'
    ) THEN
      ALTER TABLE public.order_items ADD COLUMN status public.order_status NOT NULL DEFAULT 'pending';
    END IF;

    CREATE INDEX IF NOT EXISTS idx_order_items_status ON public.order_items (status);
  END IF;
END
$$;
