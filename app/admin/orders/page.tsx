import type { Metadata } from 'next';
import { listOrdersAdmin } from '@/lib/orders/queries';
import { createClient } from '@/lib/supabase/server';
import { AdminOrderRowActions } from '@/components/admin/AdminOrderRowActions';
import { AdminOrdersManager } from '@/components/admin/AdminOrdersManager';

export const metadata: Metadata = { title: 'จัดการออเดอร์ | NayMos GameShop' };
export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await listOrdersAdmin(200);

  const gameIds = [...new Set(orders.map((o) => o.game_id).filter(Boolean))];
  const productIds = [...new Set(orders.map((o) => o.product_id).filter(Boolean))];
  const userIds = [...new Set(orders.map((o: any) => o.user_id).filter(Boolean))];

  const gamesMap: Record<string, any> = {};
  const productsMap: Record<string, any> = {};
  const profilesMap: Record<string, any> = {};

  try {
    const supabase = await createClient();
    if (gameIds.length) {
      const { data: games } = await supabase.from('games').select('id, name, icon, banner').in('id', gameIds);
      (games ?? []).forEach((g) => {
        gamesMap[g.id] = g;
      });
    }
    if (productIds.length) {
      const { data: products } = await supabase.from('products').select('id, name, price, cost').in('id', productIds);
      (products ?? []).forEach((p) => {
        productsMap[p.id] = p;
      });
    }
    if (userIds.length) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
      (profiles ?? []).forEach((u) => {
        profilesMap[u.id] = u;
      });
    }
  } catch {
    // ignore
  }

  return (
    <div className="space-y-6">
      <AdminOrdersManager
        initialOrders={orders}
        gamesMap={gamesMap}
        productsMap={productsMap}
        profilesMap={profilesMap}
      />
    </div>
  );
}
