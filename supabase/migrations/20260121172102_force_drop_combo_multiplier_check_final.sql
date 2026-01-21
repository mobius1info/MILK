/*
  # Force drop combo_multiplier_check constraint
  
  The constraint exists but is not visible in pg_constraint queries.
  Using multiple approaches to ensure it's removed.
*/

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
    AND conname LIKE '%combo%'
  ) LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', r.conname);
    RAISE NOTICE 'Dropped constraint: %', r.conname;
  END LOOP;
END $$;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check1;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS "combo_multiplier_check";
