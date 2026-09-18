import React from 'react';

export default function GameDetailLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Game Info Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <div className="aspect-[4/3] w-full rounded-3xl bg-slate-200 animate-pulse" />
          <div className="space-y-2 p-4 bg-white rounded-2xl border border-sky-100">
            <div className="h-6 w-3/4 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>

        {/* Right Column: Packages / Form Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-sky-100 space-y-4">
            <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`pkg-skel-${i}`} className="h-20 rounded-2xl bg-sky-50/70 border border-sky-100 animate-pulse" />
              ))}
            </div>
            <div className="h-12 w-full rounded-2xl bg-slate-100 animate-pulse mt-4" />
            <div className="h-12 w-full rounded-2xl bg-sky-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
