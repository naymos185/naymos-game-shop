import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type TrackedOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  contact_email?: string | null;
  contact_phone?: string | null;
  player_data: Record<string, unknown>;
  game_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  game_name?: string;
  product_name?: string;
};

export async function getOrderByNumber(
  orderNumber: string
): Promise<TrackedOrder | null> {
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : await createClient();
  const num = orderNumber.trim().toUpperCase();
  if (!num) return null;

  const { data, error } = await supabase.rpc('get_order_by_number', {
    p_order_number: num,
  });

  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    const { data: row } = await supabase
      .from('orders')
      .select('id, order_number, status, total, subtotal, player_data, game_id, product_id, created_at, updated_at')
      .eq('order_number', num)
      .maybeSingle();
    if (!row) return null;
    return enrichOrder(supabase, row);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return enrichOrder(supabase, row);
}

async function enrichOrder(
  supabase: ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>,
  row: Record<string, unknown>
): Promise<TrackedOrder> {
  const gameId = row.game_id as string;
  const productId = row.product_id as string;

  const [{ data: game }, { data: product }] = await Promise.all([
    supabase.from('games').select('name').eq('id', gameId).maybeSingle(),
    supabase.from('products').select('name').eq('id', productId).maybeSingle(),
  ]);

  return {
    id: row.id as string,
    order_number: row.order_number as string,
    total: Number(row.total),
    subtotal: Number(row.subtotal ?? row.total),
    status: row.status as string,
    contact_email: null,
    contact_phone: null,
    player_data: (row.player_data as Record<string, unknown>) ?? {},
    game_id: gameId,
    product_id: productId,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    game_name: game?.name,
    product_name: product?.name,
  };
}

export async function listOrdersAdmin(limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, total, contact_email, contact_phone, created_at, game_id, product_id')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

export async function listOrdersForCurrentUser(limit = 50) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, status, total, contact_email, contact_phone, created_at, game_id, product_id, player_data'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}
