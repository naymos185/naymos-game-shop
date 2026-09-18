import type { GameWithDetails } from '@/lib/games/queries';
import type { ProductCategory } from '@/types/game';

export const catalogKeys = {
  all: ['games'] as const,
  games: (category: string = 'all') => ['games', category] as const,
  game: (gameIdOrSlug: string) => ['game', gameIdOrSlug] as const,
  packages: (gameId: string) => ['packages', gameId] as const,
  categories: () => ['categories'] as const,
};

export async function fetchGamesByCategory(category: string): Promise<GameWithDetails[]> {
  const params = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`/api/games${params}`);
  if (!res.ok) throw new Error('ไม่สามารถโหลดรายการเกมได้');
  const json = await res.json();
  return (json?.games ?? []) as GameWithDetails[];
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('ไม่สามารถโหลดหมวดหมู่ได้');
  const json = await res.json();
  return (json?.categories ?? []) as ProductCategory[];
}
