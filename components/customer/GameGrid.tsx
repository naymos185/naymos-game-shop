'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { useMemo, useRef, useState, type PointerEvent } from 'react';
import type { GameWithDetails } from '@/lib/games/queries';

type GameGridProps = {
  games: GameWithDetails[];
};

const ALL_GAMES = 'ทั้งหมด';

export function GameGrid({ games }: GameGridProps) {
  const categories = useMemo(
    () => [ALL_GAMES, ...Array.from(new Set(games.map((game) => game.category)))],
    [games],
  );
  const [category, setCategory] = useState(ALL_GAMES);
  const [touchedCard, setTouchedCard] = useState<string | null>(null);
  const trackingPointer = useRef<number | null>(null);

  const visibleGames = useMemo(
    () => (category === ALL_GAMES ? games : games.filter((game) => game.category === category)),
    [category, games],
  );

  const cardAtPoint = (clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY);
    return element?.closest<HTMLElement>('[data-game-card]')?.dataset.gameCard ?? null;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    trackingPointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setTouchedCard(cardAtPoint(event.clientX, event.clientY));
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (trackingPointer.current !== event.pointerId) return;
    const nextCard = cardAtPoint(event.clientX, event.clientY);
    setTouchedCard((currentCard) => (currentCard === nextCard ? currentCard : nextCard));
  };

  const stopTracking = (event: PointerEvent<HTMLDivElement>) => {
    if (trackingPointer.current !== event.pointerId) return;
    trackingPointer.current = null;
    setTouchedCard(null);
  };

  return (
    <>
      {categories.length > 2 && (
        <div className="mb-7 flex gap-2 overflow-x-auto pb-2" aria-label="หมวดหมู่เกม">
          {categories.map((item) => {
            const isActive = item === category;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  if (!isActive) setCategory(item);
                }}
                className={`game-category shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold ${
                  isActive
                    ? 'game-category-active border-red-500/70 bg-red-600/15 text-red-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}

      <div
        key={category}
        className="game-grid-enter grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopTracking}
        onPointerCancel={stopTracking}
        onLostPointerCapture={stopTracking}
      >
        {visibleGames.map((game) => (
          <Link
            key={game.slug}
            href={`/games/${game.slug}`}
            data-game-card={game.slug}
            className={`game-card group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 ${
              touchedCard === game.slug ? 'game-card-touch-active' : ''
            }`}
          >
            <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${game.color}`}>
              <Gamepad2 className="game-card-icon h-12 w-12 text-white/80" />
            </div>
            <div className="p-4">
              <h2 className="font-semibold">{game.name}</h2>
              <p className="mt-0.5 text-sm text-zinc-500">{game.category}</p>
              <p className="mt-2 text-xs text-red-400">{game.products.length} แพ็กเกจ</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
