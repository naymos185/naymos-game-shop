import { createClient } from '@/lib/supabase/server';
import { MOCK_GAMES, type MockGame } from '@/lib/data/games';
import type { Game, GameField, Product, ProductCategory } from '@/types/game';

export type GameWithDetails = Game & {
  game_fields: GameField[];
  products: Product[];
  color: string;
  product_category?: ProductCategory | null;
};

function allowMockFallback(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.ALLOW_MOCK_GAMES === 'false') return false;
  return process.env.ALLOW_MOCK_GAMES === 'true' || process.env.NODE_ENV === 'development';
}

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
      key: f.name,
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

    // ดึง games แบบไม่ join ก่อน (ปลอดภัยกว่า)
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !games?.length) {
      return allowMockFallback() ? MOCK_GAMES.map(mockToGameWithDetails) : [];
    }

    const ids = games.map((g) => g.id);

    // ดึง fields + products + categories แยก (ไม่ให้พังทั้งก้อน)
    const [fieldsRes, productsRes, categoriesRes] = await Promise.all([
      supabase.from('game_fields').select('*').in('game_id', ids).order('sort_order'),
      supabase
        .from('products')
        .select('*')
        .in('game_id', ids)
        .eq('is_active', true)
        .order('sort_order'),
      supabase.from('product_categories').select('*').eq('is_active', true),
    ]);

    const fields = fieldsRes.data ?? [];
    const products = productsRes.data ?? [];
    const categories = (categoriesRes.data ?? []) as ProductCategory[];
    const catMap = new Map(categories.map((c) => [c.id, c]));

    return games.map((g) => ({
      ...(g as Game),
      product_category: g.product_category_id
        ? catMap.get(g.product_category_id) ?? null
        : null,
      color: COLOR_MAP[g.slug] ?? 'from-blue-600 to-blue-800',
      game_fields: fields.filter((f) => f.game_id === g.id) as GameField[],
      products: products.filter((p) => p.game_id === g.id) as Product[],
    }));
  } catch {
    return allowMockFallback() ? MOCK_GAMES.map(mockToGameWithDetails) : [];
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
      if (!allowMockFallback()) return null;
      const mock = MOCK_GAMES.find((m) => m.slug === slug);
      return mock ? mockToGameWithDetails(mock, 0) : null;
    }

    const [fieldsRes, productsRes, catRes] = await Promise.all([
      supabase.from('game_fields').select('*').eq('game_id', game.id).order('sort_order'),
      supabase
        .from('products')
        .select('*')
        .eq('game_id', game.id)
        .eq('is_active', true)
        .order('sort_order'),
      game.product_category_id
        ? supabase
            .from('product_categories')
            .select('*')
            .eq('id', game.product_category_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return {
      ...(game as Game),
      product_category: (catRes.data as ProductCategory) ?? null,
      color: COLOR_MAP[game.slug] ?? 'from-blue-600 to-blue-800',
      game_fields: (fieldsRes.data ?? []) as GameField[],
      products: (productsRes.data ?? []) as Product[],
    };
  } catch {
    if (!allowMockFallback()) return null;
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

    const { data: categories } = await supabase
      .from('product_categories')
      .select('*');

    const catMap = new Map(
      ((categories ?? []) as ProductCategory[]).map((c) => [c.id, c]),
    );

    return data.map((g) => ({
      ...(g as Game),
      product_category: g.product_category_id
        ? catMap.get(g.product_category_id) ?? null
        : null,
    }));
  } catch {
    return [];
  }
}
