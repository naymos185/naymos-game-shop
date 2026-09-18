'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Gamepad2, Layers, Search, Sparkles, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { GameWithDetails } from '@/lib/games/queries';
import type { ProductCategory } from '@/types/game';
import { catalogKeys, fetchGamesByCategory, fetchCategories } from '@/lib/query/catalog';
import { GameCard } from './GameCard';
import { GameCardSkeleton } from './GameCardSkeleton';

interface GameCategorySectionProps {
  games: GameWithDetails[];
  categories?: ProductCategory[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

// 12 Skeleton cards for desktop/tablet/mobile grid layout
const SKELETON_COUNT = 12;

export function GameCategorySection({
  games: initialGames = [],
  categories: initialCategories = [],
  title = 'รายการทั้งหมด',
  subtitle = 'เลือกเกมหรือบริการที่ต้องการเติมเงิน ระบบอัตโนมัติ รวดเร็ว ปลอดภัย 100%',
}: GameCategorySectionProps) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Categories Query with TanStack Query Cache
  const { data: categories = initialCategories } = useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: fetchCategories,
    initialData: initialCategories.length > 0 ? initialCategories : undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // 2. Active Category Games Query
  // - If cached: returns data instantly (0ms) without showing Skeleton
  // - If not cached: isLoading is true -> renders GameCardSkeleton immediately
  // - If cached but stale: returns cached data immediately, isFetching=true for background sync
  const {
    data: games,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: catalogKeys.games(selectedCategory),
    queryFn: () => fetchGamesByCategory(selectedCategory),
    initialData: selectedCategory === 'all' && initialGames.length > 0 ? initialGames : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  // 3. Controlled Background Prefetching (Low Concurrency, No Supabase Flood)
  useEffect(() => {
    if (!categories || categories.length === 0) return;
    let isCancelled = false;

    const runSequentialPrefetch = async () => {
      // Small initial delay so initial page interactive paint is completely finished
      await new Promise((resolve) => setTimeout(resolve, 1500));

      for (const cat of categories) {
        if (isCancelled) break;
        const key = catalogKeys.games(cat.id);

        // Prefetch only if not already in cache
        if (!queryClient.getQueryData(key)) {
          try {
            await queryClient.prefetchQuery({
              queryKey: key,
              queryFn: () => fetchGamesByCategory(cat.id),
              staleTime: 5 * 60 * 1000,
            });
          } catch {
            // Ignore background prefetch errors silently
          }

          // 800ms cooldown between categories to protect Supabase bandwidth
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    };

    runSequentialPrefetch();

    return () => {
      isCancelled = true;
    };
  }, [categories, queryClient]);

  // 4. Instant On-Demand Prefetch on Hover / Touch
  const handleCategoryHover = useCallback(
    (categoryId: string) => {
      const key = catalogKeys.games(categoryId);
      if (!queryClient.getQueryData(key)) {
        queryClient.prefetchQuery({
          queryKey: key,
          queryFn: () => fetchGamesByCategory(categoryId),
          staleTime: 5 * 60 * 1000,
        });
      }
    },
    [queryClient]
  );

  // 5. Client Search Filter over active category items
  const activeGames = games ?? [];
  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeGames;
    return activeGames.filter(
      (game) =>
        game.name.toLowerCase().includes(q) ||
        (game.category && game.category.toLowerCase().includes(q))
    );
  }, [activeGames, searchQuery]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-sky-100/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-700 text-xs font-semibold mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>บริการเติมเกมและสินค้าทั้งหมด</span>
            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-1 text-[10px] text-sky-600 bg-white/90 px-2 py-0.5 rounded-full ml-1 shadow-2xs">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                อัปเดตข้อมูลเบื้องหลัง
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อเกมหรือบริการ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-sky-200/80 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 placeholder:text-slate-400 text-slate-800 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs with Instant Client State */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedCategory('all')}
          onMouseEnter={() => handleCategoryHover('all')}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 shadow-2xs cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-sky-600 text-white shadow-sky-500/20 shadow-md scale-[1.02]'
              : 'bg-white text-slate-600 hover:bg-sky-50/80 hover:text-sky-700 border border-sky-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ทั้งหมด</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              onMouseEnter={() => handleCategoryHover(cat.id)}
              onTouchStart={() => handleCategoryHover(cat.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 shadow-2xs cursor-pointer ${
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

      {/* GameGrid: Skeleton Loading vs Real Cards without Layout Shift */}
      {isLoading ? (
        <div
          role="status"
          aria-label="กำลังโหลดรายการเกม"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5"
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <GameCardSkeleton key={`skeleton-${idx}`} />
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-sky-100 text-center my-4">
          <Gamepad2 className="w-12 h-12 text-sky-300 mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-slate-700">ไม่พบรายการที่ค้นหา</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
            {searchQuery
              ? `ไม่พบผลการค้นหาสำหรับ "${searchQuery}" ในหมวดหมู่นี้`
              : 'ยังไม่มีรายการเกมในหมวดหมู่นี้'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            ดูรายการทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 transition-opacity duration-200">
          {filteredGames.map((game, index) => (
            <GameCard key={game.id} game={game} priority={index < 6} />
          ))}
        </div>
      )}
    </section>
  );
}
