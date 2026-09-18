import Link from 'next/link';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGameBySlug } from '@/lib/games/queries';
import { GameOrderForm } from '@/components/customer/GameOrderForm';
import { getProfile } from '@/lib/auth/get-user';
import { Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60; // Cache game detail for instant clicks

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: 'ไม่พบเกม' };
  return {
    title: `เติม ${game.name} | NayMos GameShop`,
    description: game.description ?? undefined,
  };
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params;
  const [game, user] = await Promise.all([getGameBySlug(slug), getProfile()]);
  if (!game) notFound();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-6">
          <Link href="/" className="hover:text-sky-600 transition">หน้าแรก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/games" className="hover:text-sky-600 transition">เกมทั้งหมด</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sky-700 font-semibold">{game.name}</span>
        </nav>

        {/* Cute Game Header Banner */}
        <div className="rounded-3xl bg-white border border-sky-100 p-5 sm:p-6 mb-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-100/40 via-sky-50/20 to-transparent rounded-full pointer-events-none" />
          
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-sky-50 border border-sky-200 p-1 shrink-0 overflow-hidden shadow-xs relative z-10">
            {game.icon || game.banner ? (
              <img
                src={game.banner || game.icon || ''}
                alt={game.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : null}
          </div>

          <div className="text-center sm:text-left relative z-10 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-0.5">
                {game.category || 'Game'}
              </span>
              <span className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> ไม่ต้องใช้รหัสผ่าน
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">เติม {game.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">{game.description || 'เติมเกมอัตโนมัติ รวดเร็ว ปลอดภัย 100%'}</p>
          </div>
        </div>

        {/* Cute Step Progress & Order Form */}
        <GameOrderForm game={game} userRole={user?.role} isLoggedIn={!!user} />
      </div>
    </CustomerLayout>
  );
}
