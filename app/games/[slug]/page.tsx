import Link from 'next/link';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGameBySlug, MOCK_GAMES } from '@/lib/data/games';
import { GameOrderForm } from '@/components/customer/GameOrderForm';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return MOCK_GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) return { title: 'ไม่พบเกม' };
  return {
    title: `เติม ${game.name}`,
    description: game.description,
  };
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) notFound();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-sm text-zinc-500 mb-6">
          <Link href="/games" className="hover:text-red-400">เกมทั้งหมด</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">{game.name}</span>
        </nav>

        <div className={`rounded-2xl bg-gradient-to-br ${game.color} p-6 mb-8`}>
          <p className="text-white/70 text-sm mb-1">{game.category}</p>
          <h1 className="text-3xl font-bold text-white mb-2">เติม {game.name}</h1>
          <p className="text-white/80 text-sm">{game.description}</p>
        </div>

        <GameOrderForm game={game} />
      </div>
    </CustomerLayout>
  );
}
