'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Gamepad2, Layers, Search, Sparkles, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { GameWithDetails } from '@/lib/games/queries';
import type { ProductCategory } from '@/types/game';
import { catalogKeys, fetchGamesByCategory, fetchCategories } from '@/lib/query/catalog';
import { GameCard } from './GameCard';

interface GameCategorySectionProps {
  games: GameWithDetails[];
  categories?: ProductCategory[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function GameCategorySection({
  games: initialGames = [],
  categories: initialCategories = [],
  title = 'รายการทั้งหมด',
  subtitle = 'เลือกเกมหรือบริการที่ต้องการเติมเงิน ระบบอัตโนมัติ รวดเร็ว ปลอดภัย 100%',
}: GameCategorySectionProps) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Categories query with SSR fallback
  const { data: categories = initialCategories } = useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: fetchCategories,
    initialData: initialCategories.length > 0 ? initialCategories : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Seed individual category caches from initialGames on initial mount if available
  useEffect(() => {
    if (initialGames.length > 0) {
      queryClient.setQueryData(catalogKeys.games('all'), initialGames);

      if (initialCategories.length > 0) {
        initialCategories.forEach((cat) => {
          const categoryGames = initialGames.filter(
            (g) =>
              g.product_category_id === cat.id ||
              g.product_category?.slug === cat.slug ||
              g.product_category?.id === cat.id
          );
          if (categoryGames.length > 0) {
            queryClient.setQueryData(catalogKeys.games(cat.id), categoryGames);
            if (cat.slug) {
              queryClient.setQueryData(catalogKeys.games(cat.slug), categoryGames);
            }
          }
        });
      }
    }
  }, [initialGames, initialCategories, queryClient]);

  // 2. Games query by selectedCategory
  const {
    data: games = initialGames,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: catalogKeys.games(selectedCategory),
    queryFn: () => fetchGamesByCategory(selectedCategory),
    initialData: selectedCategory === 'all' ? initialGames : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // 3. Prefetch handler on hover/focus/touch with deduplication
  const prefetchCategory = useCallback(
    (categoryId: string) => {
      queryClient.prefetchQuery({
        queryKey: catalogKeys.games(categoryId),
        queryFn: () => fetchGamesByCategory(categoryId),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  // 4. Auto-prefetch adjacent category when user selects a category (low-priority)
  useEffect(() => {
    if (!categories || categories.length === 0) return;
    const currentIndex = categories.findIndex((c) => c.id === selectedCategory || c.slug === selectedCategory);
    const nextCat = categories[currentIndex + 1] || categories[0];
    if (nextCat && nextCat.id !== selectedCategory) {
      const timer = setTimeout(() => {
        prefetchCategory(nextCat.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, categories, prefetchCategory]);

  // 5. Memoized search filter
  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return games;
    return games.filter(
      (game) =>
        game.name.toLowerCase().includes(q) ||
        (game.category && game.category.toLowerCase().includes(q))
    );
  }, [games, searchQuery]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-sky-100/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-700 text-xs font-semibold mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>บริการเติมเกมและสินค้าทั้งหมด</span>
            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-1 text-[10px] text-sky-600 bg-white/80 px-2 py-0.5 rounded-full ml-1">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                อัปเดตเบื้องหลัง
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>

        <div className="relative w-full md:w-72 lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อเกมหรือบริการ..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sky-200 bg-white/95 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30 focus:border-sky-500 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              ล้าง
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedCategory('all')}
          onMouseEnter={() => prefetchCategory('all')}
          onFocus={() => prefetchCategory('all')}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs ${
            selectedCategory === 'all'
              ? 'bg-sky-600 text-white shadow-sky-500/20 shadow-md scale-[1.02]'
              : 'bg-white text-slate-600 hover:bg-sky-50/80 hover:text-sky-700 border border-sky-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ทั้งหมด</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              onMouseEnter={() => prefetchCategory(cat.id)}
              onFocus={() => prefetchCategory(cat.id)}
              onTouchStart={() => prefetchCategory(cat.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-sky-500/20 shadow-md scale-[1.02]'
                  : 'bg-white text-slate-600 hover:bg-sky-50/80 hover:text-sky-700 border border-sky-100'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {isLoading && filteredGames.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white rounded-xl sm:rounded-2xl border border-sky-100 p-2 sm:p-2.5 animate-pulse"
            >
              <div className="aspect-square w-full rounded-lg sm:rounded-xl bg-sky-100/60" />
              <div className="mt-2.5 h-4 w-3/4 rounded-md bg-sky-100/80" />
              <div className="mt-1.5 h-3 w-1/2 rounded-md bg-slate-100" />
            </div>
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-sky-100 text-center my-4">
          <Gamepad2 className="w-12 h-12 text-sky-300 mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-slate-700">ไม่พบรายการที่ค้นหา</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
            ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูรายการทั้งหมด
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs sm:text-sm font-semibold transition"
          >
            ดูรายการทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {filteredGames.map((game, index) => (
            <GameCard key={game.id} game={game} priority={index < 6} />
          ))}
        </div>
      )}
    </section>
  );
}
