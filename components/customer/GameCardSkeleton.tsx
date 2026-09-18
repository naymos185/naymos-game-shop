import React, { memo } from 'react';

export const GameCardSkeleton = memo(function GameCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-sky-100/90 p-2 sm:p-2.5 shadow-2xs pointer-events-none select-none overflow-hidden"
    >
      {/* Thumbnail Aspect Square Skeleton with soft shimmer */}
      <div className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-sky-100/70 via-sky-50 to-blue-100/50 border border-sky-100/60 animate-pulse">
        {/* Subtle category badge skeleton */}
        <div className="absolute top-1.5 left-1.5 w-12 sm:w-14 h-4 rounded-md bg-white/70 backdrop-blur-xs border border-sky-100/40" />
      </div>

      {/* Title & Metadata Skeleton */}
      <div className="mt-2 sm:mt-2.5 flex flex-col flex-1 px-1 pb-1 space-y-1.5">
        {/* Game Title line */}
        <div className="h-3.5 sm:h-4 w-4/5 rounded-md bg-sky-100/80 animate-pulse" />

        {/* Subtitle / Price row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="h-2.5 sm:h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
          <div className="h-2.5 sm:h-3 w-1/4 rounded bg-sky-100/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
});
