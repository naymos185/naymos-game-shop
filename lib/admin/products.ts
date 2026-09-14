import { createClient } from '@/lib/supabase/server';

export type AdminProductRow = {
  id: string;
  name: string;
  price: number;
  cost: number;
  reseller_price?: number | null;
  is_active: boolean;
  sort_order: number;
  game_id: string;
  game_name?: string;
  created_at: string;
};

export async function listProductsAdmin(limit = 200): Promise<AdminProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, cost, reseller_price, is_active, sort_order, game_id, created_at')
    .order('sort_order', { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  const gameIds = [...new Set(data.map((p) => p.game_id))];
  const names: Record<string, string> = {};
  if (gameIds.length) {
    const { data: games } = await supabase.from('games').select('id, name').in('id', gameIds);
    (games ?? []).forEach((g) => {
      names[g.id] = g.name;
    });
  }

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    cost: Number(p.cost ?? 0),
    reseller_price: p.reseller_price != null ? Number(p.reseller_price) : null,
    is_active: p.is_active,
    sort_order: p.sort_order ?? 0,
    game_id: p.game_id,
    game_name: names[p.game_id],
    created_at: p.created_at,
  }));
}
