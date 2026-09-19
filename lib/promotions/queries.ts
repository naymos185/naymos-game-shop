import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createPublicClient, createClient } from '@/lib/supabase/server';

export type Promotion = {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

const PROMOTION_COLUMNS = 'id, title, description, badge, image_url, link_url, sort_order, is_active, starts_at, ends_at, created_at';

const getCachedActivePromotions = unstable_cache(
  async (): Promise<Promotion[]> => {
    try {
      const supabase = createPublicClient();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('promotions')
        .select(PROMOTION_COLUMNS)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error || !data) return [];
      const now = Date.now();
      return (data as Record<string, any>[])
        .filter((p) => {
          if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
          if (p.ends_at && new Date(p.ends_at).getTime() < now) return false;
          return true;
        })
        .map(mapPromo);
    } catch {
      return [];
    }
  },
  ['active-promotions-list'],
  { revalidate: 60, tags: ['promotions'] }
);

export const getActivePromotions = cache(async (): Promise<Promotion[]> => {
  return getCachedActivePromotions();
});

export async function listPromotionsAdmin(): Promise<Promotion[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data.map(mapPromo);
  } catch {
    return [];
  }
}

function mapPromo(p: Record<string, unknown>): Promotion {
  return {
    id: String(p.id),
    title: String(p.title),
    description: (p.description as string) ?? null,
    badge: (p.badge as string) ?? null,
    image_url: (p.image_url as string) ?? null,
    link_url: (p.link_url as string) ?? null,
    sort_order: Number(p.sort_order ?? 0),
    is_active: Boolean(p.is_active),
    starts_at: (p.starts_at as string) ?? null,
    ends_at: (p.ends_at as string) ?? null,
    created_at: String(p.created_at),
  };
}
