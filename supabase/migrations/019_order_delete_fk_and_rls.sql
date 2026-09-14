-- 019: Ensure admin order deletion works end-to-end.
-- payments.order_id must be ON DELETE CASCADE (payments disappear with the order).
-- point_ledger.order_id must be ON DELETE SET NULL (point history is preserved).
-- Idempotent: only re-creates a foreign key when its ON DELETE action is wrong.

DO $$
DECLARE
  v_attnum smallint;
BEGIN
  SELECT attnum INTO v_attnum
  FROM pg_attribute
  WHERE attrelid = 'public.payments'::regclass AND attname = 'order_id';

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.payments'::regclass
      AND contype = 'f'
      AND confdeltype = 'c'
      AND v_attnum = ANY (conkey)
  ) THEN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_order_id_fkey;
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
  END IF;

  SELECT attnum INTO v_attnum
  FROM pg_attribute
  WHERE attrelid = 'public.point_ledger'::regclass AND attname = 'order_id';

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.point_ledger'::regclass
      AND contype = 'f'
      AND confdeltype = 'n'
      AND v_attnum = ANY (conkey)
  ) THEN
    ALTER TABLE public.point_ledger DROP CONSTRAINT IF EXISTS point_ledger_order_id_fkey;
    ALTER TABLE public.point_ledger
      ADD CONSTRAINT point_ledger_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Re-assert admin DELETE grants/policies (idempotent, mirrors 018).
GRANT DELETE ON public.orders, public.payments TO authenticated, service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;
    CREATE POLICY "Admins delete orders" ON public.orders
      FOR DELETE TO authenticated
      USING (public.is_admin());

    DROP POLICY IF EXISTS "Admins delete payments" ON public.payments;
    CREATE POLICY "Admins delete payments" ON public.payments
      FOR DELETE TO authenticated
      USING (public.is_admin());
  END IF;
END $$;
