'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Layers, Search, Sparkles } from 'lucide-react';
import type { GameWithDetails } from '@/lib/games/queries';
import type { ProductCategory } from '@/types/game';

interface GameCategorySectionProps {
  games: GameWithDetails[];
  categories?: ProductCategory[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function GameCategorySection({
  games,
  categories = [],
  title = 'รายการทั้งหมด',
  subtitle = 'เลือกเกมหรือบริการที่ต้องการเติมเงิน ระบบอัตโนมัติ รวดเร็ว ปลอดภัย 100%',
}: GameCategorySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter games based on search and selected generic product category
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.category && game.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;

    // Filter by product_category_id or category slug
    return (
      game.product_category_id === selectedCategory ||
      game.product_category?.slug === selectedCategory ||
      (game.product_category && game.product_category.id === selectedCategory)
    );
  });

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header & Search Bar with Balanced Spacing & Typography */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-sky-100/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-700 text-xs font-semibold mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>บริการเติมเกมและสินค้าทั้งหมด</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Search input with proper touch target */}
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

      {/* Category Filter Tabs with iPad/Mobile friendly horizontal scroll */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs ${
            selectedCategory === 'all'
              ? 'bg-sky-600 text-white shadow-sky-500/20 shadow-md scale-[1.02]'
              : 'bg-white text-slate-600 hover:bg-sky-50/80 hover:text-sky-700 border border-sky-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ทั้งหมด ({games.length})</span>
        </button>

        {categories.map((cat) => {
          const count = games.filter(
            (g) =>
              g.product_category_id === cat.id ||
              g.product_category?.slug === cat.slug ||
              g.product_category?.id === cat.id
          ).length;

          const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-sky-500/20 shadow-md scale-[1.02]'
                  : 'bg-white text-slate-600 hover:bg-sky-50/80 hover:text-sky-700 border border-sky-100'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-sky-700/80 text-white' : 'bg-sky-50 text-sky-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product / Game Cards Grid - Balanced proportions, refined image size, airy spacing */}
      {filteredGames.length === 0 ? (
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
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.slug}`} prefetch={true}
              className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-sky-100/90 p-2 sm:p-2.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Image container: Slightly reduced size, airy & balanced proportions */}
              <div className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-sky-50/80 to-blue-50/80 border border-sky-100/50 flex items-center justify-center">
                {game.icon ? (
                  <Image
                    src={game.icon}
                    alt={game.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400 group-hover:scale-110 transition-transform" />
                )}
                {game.product_category?.name && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[9px] sm:text-[10px] font-bold text-sky-700 shadow-2xs border border-sky-100/60">
                    {game.product_category.name}
                  </div>
                )}
              </div>

              {/* Title & Metadata with clean typography */}
              <div className="mt-2 sm:mt-2.5 flex flex-col flex-1 px-1 pb-1">
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
                  {game.name}
                </h3>
                <div className="flex items-center justify-between mt-1 text-[10px] sm:text-[11px] text-slate-400">
                  <span className="line-clamp-1">{game.category || 'เติมเกมออนไลน์'}</span>
                  <span className="text-sky-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    เติมเงิน &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
