-- Migration 022: Add 'key' column to game_fields for dynamic field support
-- Safe: uses IF NOT EXISTS and backward compatible
-- This adds the 'key' column while keeping 'name' for backward compatibility

-- Add 'key' column if it doesn't exist
DO $$
BEGIN
  ALTER TABLE public.game_fields ADD COLUMN key TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Copy 'name' to 'key' where 'key' is null (existing records)
UPDATE public.game_fields SET key = name WHERE key IS NULL;

-- Make 'key' NOT NULL for new records
ALTER TABLE public.game_fields ALTER COLUMN key SET NOT NULL;

-- Add unique constraint on (game_id, key)
DO $$
BEGIN
  ALTER TABLE public.game_fields ADD CONSTRAINT unique_game_id_key UNIQUE (game_id, key);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Update type check constraint to include 'password' type
ALTER TABLE public.game_fields DROP CONSTRAINT IF EXISTS game_fields_type_check;
ALTER TABLE public.game_fields ADD CONSTRAINT game_fields_type_check 
  CHECK (type IN ('text', 'number', 'password', 'select'));

-- Add trigger for 'key' column if not exists
DROP TRIGGER IF EXISTS set_game_fields_updated_at ON public.game_fields;
CREATE TRIGGER set_game_fields_updated_at
  BEFORE UPDATE ON public.game_fields
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
