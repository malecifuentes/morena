-- Run once in the EXISTING Morena Supabase project's SQL Editor.
-- This migration preserves the Session 8 table, IDs, folios and old orders.
BEGIN;

ALTER TABLE public.order_requests ADD COLUMN IF NOT EXISTS items jsonb;
ALTER TABLE public.order_requests ALTER COLUMN created_at SET DEFAULT now();

-- Replace only checks that reference status; other existing constraints stay.
DO $$
DECLARE existing_check record;
BEGIN
  FOR existing_check IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.order_requests'::regclass AND contype = 'c'
      AND (SELECT attnum FROM pg_attribute
           WHERE attrelid = 'public.order_requests'::regclass AND attname = 'status') = ANY(conkey)
  LOOP
    EXECUTE format('ALTER TABLE public.order_requests DROP CONSTRAINT %I', existing_check.conname);
  END LOOP;
END $$;

UPDATE public.order_requests SET status = 'Received' WHERE status = 'Pending';
ALTER TABLE public.order_requests ALTER COLUMN status SET DEFAULT 'Received';
ALTER TABLE public.order_requests ALTER COLUMN status SET NOT NULL;
-- Cancelled remains readable for historical orders only; the trigger below
-- prevents new orders or transitions from using it.
ALTER TABLE public.order_requests ADD CONSTRAINT order_requests_status_check
  CHECK (status IN ('Received', 'Confirmed', 'Preparing', 'Completed', 'Cancelled'));

CREATE OR REPLACE FUNCTION public.morena_order_transaction()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'Received';
    NEW.order_code := 'MB-' || NEW.id::text;
    NEW.created_at := now();
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT ((OLD.status = 'Received' AND NEW.status = 'Confirmed') OR
            (OLD.status = 'Confirmed' AND NEW.status = 'Preparing') OR
            (OLD.status = 'Preparing' AND NEW.status = 'Completed')) THEN
      RAISE EXCEPTION 'Required status flow: Received -> Confirmed -> Preparing -> Completed';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS morena_order_transaction ON public.order_requests;
CREATE TRIGGER morena_order_transaction
  BEFORE INSERT OR UPDATE ON public.order_requests
  FOR EACH ROW EXECUTE FUNCTION public.morena_order_transaction();

COMMIT;
