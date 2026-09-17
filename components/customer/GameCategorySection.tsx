'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, ChevronRight, Layers, Sparkles } from 'lucide-react';
import type { Game, ProductCategory } from '@/types/game';

interface GameCategorySectionProps {
  games: Game[];
  categories?: ProductCategory[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export function GameCategorySection({
  games,
  categories = [],
  title = 'รายการทั้งหมด',
  subtitle = 'เลือกสินค้าหรือบริการที่คุณต้องการ ระบบอัตโนมัติ รวดเร็ว ปลอดภัย 100%',
  showViewAll = true,
}: GameCategorySectionProps) {
  // selectedCategoryId: 'all' or specific category id / slug
  const [selectedId, setSelectedId] = useState<string>('all');

  // Filter items based on selected product category
  const filteredGames = useMemo(() => {
    if (selectedId === 'all') return games;
    return games.filter((g) => {
      if (g.product_category_id && g.product_category_id === selectedId) return true;
      if (g.product_category?.slug && g.product_category.slug === selectedId) return true;
      // Fallback heuristics if category hasn't been migrated
      if (selectedId === 'topup-uid') {
        const hasPassword = g.game_fields?.some(
          (f) => f.type === 'password' || f.key?.toLowerCase().includes('pass')
        );
        return !hasPassword;
      }
      if (selectedId === 'topup-id-pass') {
        return g.game_fields?.some(
          (f) => f.type === 'password' || f.key?.toLowerCase().includes('pass')
        );
      }
      return false;
    });
  }, [games, selectedId]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>บริการและสินค้าคุณภาพ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        {showViewAll && (
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700 transition group self-start sm:self-end"
          >
            <span>ดูทั้งหมด</span>
            <ChevronRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Dynamic Product Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedId('all')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            selectedId === 'all'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-100'
              : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-600 border border-sky-100'
          }`}
        >
          ทั้งหมด
        </button>

        {categories.map((cat) => {
          const isSelected = selectedId === cat.id || selectedId === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedId(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-100'
                  : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-600 border border-sky-100'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Grid of items */}
      {filteredGames.length === 0 ? (
        <div className="py-12 text-center rounded-3xl bg-white border border-sky-100 p-8 shadow-xs">
          <Layers className="w-12 h-12 text-sky-200 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">ยังไม่มีสินค้าในหมวดหมู่นี้</h3>
          <p className="text-xs text-slate-400 mt-1">
            แอดมินกำลังอัปเดตรายการสินค้าใหม่ ๆ โปรดตรวจสอบอีกครั้งเร็ว ๆ นี้
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.slug}`}
              className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-sky-100/80 p-2.5 sm:p-3 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100/50 flex items-center justify-center">
                {game.icon ? (
                  <Image
                    src={game.icon}
                    alt={game.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Gamepad2 className="w-10 h-10 text-sky-400 group-hover:scale-110 transition-transform" />
                )}
                {game.product_category?.name && (
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-sky-700 shadow-2xs">
                    {game.product_category.name}
                  </div>
                )}
              </div>
              <div className="mt-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-sky-600 transition">
                    {game.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {game.description || 'บริการอัตโนมัติ 24 ชม.'}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-sky-50 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-sky-600">เริ่มต้นรวดเร็ว</span>
                  <span className="w-5 h-5 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition">
                    →
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
