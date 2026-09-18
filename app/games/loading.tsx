import React from 'react';
import { GameCardSkeleton } from '@/components/customer/GameCardSkeleton';

export default function GamesLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-sky-100/80">
        <div className="space-y-2">
          <div className="h-6 sm:h-8 w-44 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-3.5 w-72 rounded-md bg-slate-100 animate-pulse" />
        </div>
        <div className="h-10 w-full md:w-72 rounded-2xl bg-white border border-sky-100 animate-pulse" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 overflow-hidden pb-3 mb-6 sm:mb-8">
        <div className="h-9 w-20 rounded-xl bg-sky-500/20 animate-pulse shrink-0" />
        <div className="h-9 w-24 rounded-xl bg-sky-100/80 animate-pulse shrink-0" />
        <div className="h-9 w-28 rounded-xl bg-sky-100/80 animate-pulse shrink-0" />
        <div className="h-9 w-24 rounded-xl bg-sky-100/80 animate-pulse shrink-0" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <GameCardSkeleton key={`games-skeleton-${i}`} />
        ))}
      </div>
    </div>
  );
}
