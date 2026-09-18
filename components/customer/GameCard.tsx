'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2 } from 'lucide-react';
import type { GameWithDetails } from '@/lib/games/queries';

interface GameCardProps {
  game: GameWithDetails;
  priority?: boolean;
}

export const GameCard = memo(function GameCard({ game, priority = false }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      prefetch={true}
      className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-sky-100/90 p-2 sm:p-2.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-sky-50/80 to-blue-50/80 border border-sky-100/50 flex items-center justify-center">
        {game.icon ? (
          <Image
            src={game.icon}
            alt={game.name}
            fill
            unoptimized
            loading={priority ? 'eager' : 'lazy'}
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
  );
});
