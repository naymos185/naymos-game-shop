import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createPublicClient, createClient } from '@/lib/supabase/server';

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

const BANNER_COLUMNS = 'id, title, subtitle, image_url, link_url, button_text, sort_order, is_active, created_at';

function mapBanner(b: Record<string, unknown>): Banner {
  return {
    id: String(b.id),
    title: String(b.title),
    subtitle: (b.subtitle as string) ?? null,
    image_url: (b.image_url as string) ?? null,
    link_url: (b.link_url as string) ?? null,
    button_text: (b.button_text as string) ?? null,
    sort_order: Number(b.sort_order ?? 0),
    is_active: Boolean(b.is_active),
    created_at: String(b.created_at),
  };
}

const getCachedActiveBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    try {
      const supabase = createPublicClient();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('banners')
        .select(BANNER_COLUMNS)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error || !data) return [];
      return data.map(mapBanner);
    } catch {
      return [];
    }
  },
  ['active-banners-list'],
  { revalidate: 60, tags: ['banners'] }
);

export const getActiveBanners = cache(async (): Promise<Banner[]> => {
  return getCachedActiveBanners();
});

export async function listBannersAdmin(): Promise<Banner[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data.map(mapBanner);
  } catch {
    return [];
  }
}
