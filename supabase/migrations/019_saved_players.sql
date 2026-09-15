CREATE TABLE IF NOT EXISTS public.saved_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'บัญชีหลัก',
  player_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_id, label)
);

CREATE INDEX IF NOT EXISTS idx_saved_players_user ON public.saved_players(user_id);

ALTER TABLE public.saved_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own saved players" ON public.saved_players;
CREATE POLICY "Users manage own saved players" ON public.saved_players
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_players TO authenticated;
