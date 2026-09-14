'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Gamepad2, ChevronRight, Sparkles } from 'lucide-react';
import type { Game } from '@/types/game';

interface GameCategorySectionProps {
  games: Game[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  ทั้งหมด: '🎮',
  MOBA: '⚔️',
  'Battle Royale': '🪂',
  FPS: '🎯',
  RPG: '🛡️',
  Strategy: '♟️',
  Card: '🃏',
  Casual: '🎲',
};

export function GameCategorySection({
  games,
  title = 'เกมยอดนิยม',
  subtitle = 'เลือกเกมที่คุณต้องการเติม บริการไวในไม่กี่นาที',
  showViewAll = true,
}: GameCategorySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  // Extract unique categories in order
  const categories = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      if (g.category && g.category.trim()) {
        set.add(g.category.trim());
      }
    });
    return ['ทั้งหมด', ...Array.from(set)];
  }, [games]);

  // Filter games based on selected category
  const filteredGames = useMemo(() => {
    if (selectedCategory === 'ทั้งหมด') return games;
    return games.filter((g) => (g.category || '').trim() === selectedCategory);
  }, [games, selectedCategory]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span className="text-sky-500">🎮</span> {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {subtitle}
          </p>
        </div>
        {showViewAll && (
          <Link
            href="/games"
            className="inline-flex items-center gap-1 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 px-4 py-1.5 text-xs font-bold text-sky-700 active:scale-95 transition-all duration-150 self-start sm:self-auto shadow-2xs"
          >
            ดูเกมทั้งหมด ({games.length}) <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Category Pills Navigation (Horizontal scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const icon = CATEGORY_ICONS[cat] || '✨';

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'bg-sky-100 text-sky-800 border-2 border-sky-400 shadow-xs ring-2 ring-sky-200/50'
                  : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-sky-100 hover:border-sky-200 shadow-2xs'
              }`}
            >
              <span>{icon}</span>
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-sky-200 text-sky-900' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cat === 'ทั้งหมด'
                  ? games.length
                  : games.filter((g) => (g.category || '').trim() === cat).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Game Cards Grid with Animated Fade + Slide on Category Switch */}
      <div
        key={selectedCategory}
        className="animate-fade-slide grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
      >
        {filteredGames.length > 0 ? (
          filteredGames.map((game, index) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              style={{ animationDelay: `${Math.min(index * 25, 150)}ms` }}
              className="group relative flex flex-col rounded-3xl border border-sky-100 bg-white p-3 shadow-xs hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100 hover:-translate-y-1.5 active:scale-[0.97] active:translate-y-0.5 active:shadow-sm transition-all duration-200 ease-out cursor-pointer"
            >
              {/* Game Poster / Icon Container */}
              <div className="aspect-square rounded-2xl bg-sky-50 overflow-hidden relative mb-2.5 border border-sky-50 shadow-inner">
                {game.icon || game.banner ? (
                  <img
                    src={game.banner || game.icon || ''}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 group-active:scale-100 transition-transform duration-200 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200">
                    <Gamepad2 className="h-10 w-10 text-sky-500 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                )}
                {/* Category tag */}
                <span className="absolute top-2 left-2 rounded-full bg-white/95 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-sky-800 shadow-2xs border border-sky-100">
                  {game.category || 'Game'}
                </span>
              </div>

              {/* Game Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 truncate group-hover:text-sky-600 transition-colors duration-150">
                    {game.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {game.description || 'เติมเกมออนไลน์'}
                  </p>
                </div>

                <div className="mt-3">
                  <span className="w-full inline-flex items-center justify-center rounded-full bg-sky-50 group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-blue-600 border border-sky-200 group-hover:border-transparent py-1.5 text-xs font-bold text-sky-700 group-hover:text-white group-active:scale-95 transition-all duration-150 shadow-2xs">
                    เติมเกม
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-sky-100 p-8">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-bold text-slate-700 text-sm">ไม่พบเกมในหมวดหมู่นี้</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('ทั้งหมด')}
              className="mt-3 inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold hover:bg-sky-200 active:scale-95 transition-all duration-150"
            >
              ดูเกมทั้งหมด
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
