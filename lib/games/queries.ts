import { createClient } from '@/lib/supabase/server';
import { MOCK_GAMES, type MockGame } from '@/lib/data/games';
import type { Game, GameField, Product } from '@/types/game';

export type GameWithDetails = Game & {
  game_fields: GameField[];
  products: Product[];
  color: string;
};

const COLOR_MAP: Record<string, string> = {
  'free-fire': 'from-orange-600 to-red-700',
  rov: 'from-blue-600 to-indigo-700',
  'mobile-legends': 'from-cyan-600 to-blue-700',
  valorant: 'from-red-600 to-rose-800',
  'genshin-impact': 'from-amber-500 to-orange-600',
  'pubg-mobile': 'from-yellow-600 to-amber-800',
};

function mockToGameWithDetails(m: MockGame, index: number): GameWithDetails {
  return {
    id: `mock-${m.slug}`,
    slug: m.slug,
    name: m.name,
    description: m.description,
    category: m.category,
    is_active: true,
    sort_order: index,
    color: m.color,
    game_fields: m.fields.map((f, i) => ({
      id: `mock-field-${m.slug}-${f.name}`,
      game_id: `mock-${m.slug}`,
      name: f.name,
      label: f.label,
      type: 'text' as const,
      placeholder: f.placeholder,
      required: f.required,
      sort_order: i,
    })),
    products: m.packages.map((p, i) => ({
      id: p.id,
      game_id: `mock-${m.slug}`,
      name: p.name,
      amount: p.amount ? Number(p.amount) : null,
      currency: 'THB',
      price: p.price,
      cost: 0,
      is_active: true,
      sort_order: i,
    })),
  };
}

export async function getActiveGames(): Promise<GameWithDetails[]> {
  try {
    const supabase = await createClient();
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !games?.length) {
      return MOCK_GAMES.map(mockToGameWithDetails);
    }

    const ids = games.map((g) => g.id);
    const [{ data: fields }, { data: products }] = await Promise.all([
      supabase.from('game_fields').select('*').in('game_id', ids).order('sort_order'),
      supabase.from('products').select('*').in('game_id', ids).eq('is_active', true).order('sort_order'),
    ]);

    return games.map((g) => ({
      ...(g as Game),
      color: COLOR_MAP[g.slug] ?? 'from-zinc-700 to-zinc-900',
      game_fields: (fields ?? []).filter((f) => f.game_id === g.id) as GameField[],
      products: (products ?? []).filter((p) => p.game_id === g.id) as Product[],
    }));
  } catch {
    return MOCK_GAMES.map(mockToGameWithDetails);
  }
}

export async function getGameBySlug(slug: string): Promise<GameWithDetails | null> {
  try {
    const supabase = await createClient();
    const { data: game, error } = await supabase
      .from('games')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !game) {
      const mock = MOCK_GAMES.find((m) => m.slug === slug);
      return mock ? mockToGameWithDetails(mock, 0) : null;
    }

    const [{ data: fields }, { data: products }] = await Promise.all([
      supabase.from('game_fields').select('*').eq('game_id', game.id).order('sort_order'),
      supabase.from('products').select('*').eq('game_id', game.id).eq('is_active', true).order('sort_order'),
    ]);

    return {
      ...(game as Game),
      color: COLOR_MAP[game.slug] ?? 'from-zinc-700 to-zinc-900',
      game_fields: (fields ?? []) as GameField[],
      products: (products ?? []) as Product[],
    };
  } catch {
    const mock = MOCK_GAMES.find((m) => m.slug === slug);
    return mock ? mockToGameWithDetails(mock, 0) : null;
  }
}

export async function getAllGamesAdmin(): Promise<Game[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data as Game[];
  } catch {
    return [];
  }
}
