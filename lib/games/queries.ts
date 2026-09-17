import { createClient } from '@/lib/supabase/server';
import { MOCK_GAMES, type MockGame } from '@/lib/data/games';
import type { Game, GameField, Product, ProductCategory } from '@/types/game';

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
    product_category_id: null,
    product_category: null,
    icon: m.icon,
    banner: m.banner,
    is_active: true,
    sort_order: index,
    color: m.color,
    game_fields: m.game_fields.map((f, i) => ({
      id: `mock-gf-${m.slug}-${i}`,
      game_id: `mock-${m.slug}`,
      key: f.key,
      name: f.name,
      label: f.label,
      type: (f.type as any) || 'text',
      placeholder: f.placeholder,
      required: f.required,
      sort_order: i,
    })),
    products: m.products.map((p, i) => ({
      id: `mock-prod-${m.slug}-${i}`,
      game_id: `mock-${m.slug}`,
      name: p.name,
      description: null,
      amount: p.amount,
      currency: 'THB',
      price: p.price,
      cost: p.cost,
      reseller_price: null,
      provider_product_id: null,
      is_active: true,
      sort_order: i,
    })),
  };
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error || !data) {
      return [
        { id: 'cat-uid', slug: 'topup-uid', name: 'เติมเกมแบบ UID', is_active: true, sort_order: 1 },
        { id: 'cat-id-pass', slug: 'topup-id-pass', name: 'เติมเกมแบบ ID-Pass', is_active: true, sort_order: 2 },
      ];
    }
    return data as ProductCategory[];
  } catch {
    return [
      { id: 'cat-uid', slug: 'topup-uid', name: 'เติมเกมแบบ UID', is_active: true, sort_order: 1 },
      { id: 'cat-id-pass', slug: 'topup-id-pass', name: 'เติมเกมแบบ ID-Pass', is_active: true, sort_order: 2 },
    ];
  }
}

export async function getAllProductCategoriesAdmin(): Promise<ProductCategory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data as ProductCategory[];
  } catch {
    return [];
  }
}

export async function getActiveGames(): Promise<GameWithDetails[]> {
  try {
    const supabase = await createClient();
    const { data: gamesData, error } = await supabase
      .from('games')
      .select('*, product_category:product_categories(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !gamesData || gamesData.length === 0) {
      // Fallback without product_category join if table doesn't exist yet
      const fallback = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (fallback.error || !fallback.data || fallback.data.length === 0) {
        return MOCK_GAMES.map((m, i) => mockToGameWithDetails(m, i));
      }
      return enrichGames(supabase, fallback.data);
    }

    return enrichGames(supabase, gamesData);
  } catch {
    return MOCK_GAMES.map((m, i) => mockToGameWithDetails(m, i));
  }
}

async function enrichGames(supabase: any, gamesData: any[]): Promise<GameWithDetails[]> {
  const gameIds = gamesData.map((g) => g.id);

  const [fieldsRes, productsRes] = await Promise.all([
    supabase
      .from('game_fields')
      .select('*')
      .in('game_id', gameIds)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('*')
      .in('game_id', gameIds)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  const fieldsByGame: Record<string, GameField[]> = {};
  (fieldsRes.data ?? []).forEach((f: GameField) => {
    if (!fieldsByGame[f.game_id]) fieldsByGame[f.game_id] = [];
    fieldsByGame[f.game_id].push(f);
  });

  const productsByGame: Record<string, Product[]> = {};
  (productsRes.data ?? []).forEach((p: Product) => {
    if (!productsByGame[p.game_id]) productsByGame[p.game_id] = [];
    productsByGame[p.game_id].push(p);
  });

  return gamesData.map((g) => ({
    ...g,
    color: COLOR_MAP[g.slug] ?? 'from-sky-500 to-blue-600',
    game_fields: fieldsByGame[g.id] ?? [],
    products: productsByGame[g.id] ?? [],
  }));
}

export async function getGameBySlug(slug: string): Promise<GameWithDetails | null> {
  try {
    const supabase = await createClient();
    const { data: game, error } = await supabase
      .from('games')
      .select('*, product_category:product_categories(*)')
      .eq('slug', slug)
      .single();

    if (error || !game) {
      const mockIndex = MOCK_GAMES.findIndex((m) => m.slug === slug);
      if (mockIndex !== -1) {
        return mockToGameWithDetails(MOCK_GAMES[mockIndex], mockIndex);
      }
      return null;
    }

    const [fieldsRes, productsRes] = await Promise.all([
      supabase
        .from('game_fields')
        .select('*')
        .eq('game_id', game.id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select('*')
        .eq('game_id', game.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    return {
      ...game,
      color: COLOR_MAP[game.slug] ?? 'from-sky-500 to-blue-600',
      game_fields: fieldsRes.data ?? [],
      products: productsRes.data ?? [],
    };
  } catch {
    const mockIndex = MOCK_GAMES.findIndex((m) => m.slug === slug);
    if (mockIndex !== -1) {
      return mockToGameWithDetails(MOCK_GAMES[mockIndex], mockIndex);
    }
    return null;
  }
}

export async function getAllGamesAdmin(): Promise<Game[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('games')
      .select('*, product_category:product_categories(*)')
      .order('sort_order', { ascending: true });

    if (error || !data) {
      const fallback = await supabase
        .from('games')
        .select('*')
        .order('sort_order', { ascending: true });
      return (fallback.data as Game[]) ?? [];
    }
    return data as Game[];
  } catch {
    return [];
  }
}
