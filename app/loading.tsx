import React from 'react';
import { GameCardSkeleton } from '@/components/customer/GameCardSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Top Navbar Skeleton Placeholder */}
      <div className="w-full bg-white/95 border-b border-sky-100/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100/80 animate-pulse" />
            <div className="h-5 w-32 rounded-lg bg-sky-100/70 animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 rounded-full bg-sky-50 border border-sky-100 animate-pulse hidden md:block" />
            <div className="h-9 w-24 rounded-full bg-sky-100/80 animate-pulse" />
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Banner Skeleton */}
        <section className="pt-4 pb-6 sm:py-6 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="w-full rounded-3xl border border-sky-100 bg-white overflow-hidden shadow-xs">
            <div className="relative aspect-[1810/869] w-full bg-gradient-to-br from-sky-100/70 via-sky-50 to-blue-100/50 animate-pulse" />
            <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-sky-50">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-sky-100 animate-pulse shrink-0 hidden sm:block" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-64 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-full sm:w-36 rounded-full bg-sky-200/80 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Category Tabs Skeleton */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-sky-100/80">
            <div className="space-y-2">
              <div className="h-3 w-28 rounded-full bg-sky-100 animate-pulse" />
              <div className="h-6 sm:h-7 w-40 rounded-lg bg-slate-200 animate-pulse" />
            </div>
            <div className="h-10 w-64 rounded-2xl bg-white border border-sky-100 animate-pulse hidden md:block" />
          </div>

          <div className="flex items-center gap-2 overflow-hidden pb-4 mb-6">
            <div className="h-9 w-20 rounded-xl bg-sky-500/20 animate-pulse shrink-0" />
            <div className="h-9 w-24 rounded-xl bg-sky-100/80 animate-pulse shrink-0" />
            <div className="h-9 w-28 rounded-xl bg-sky-100/80 animate-pulse shrink-0" />
            <div className="h-9 w-24 rounded-xl bg-sky-100/80 animate-pulse shrink-0" />
          </div>

          {/* Game Cards Skeleton Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <GameCardSkeleton key={`root-skeleton-${i}`} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
