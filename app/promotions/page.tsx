import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getActivePromotions } from '@/lib/promotions/queries';
import { Tag } from 'lucide-react';

export const metadata: Metadata = { title: 'โปรโมชั่น' };
export const dynamic = 'force-dynamic';

export default async function PromotionsPage() {
  const promotions = await getActivePromotions();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">โปรโมชั่น</h1>
        <p className="text-zinc-400 mb-8">ดีลพิเศษจาก NayMos GameShop</p>

        {promotions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center">
            <p className="text-zinc-400 mb-4">ยังไม่มีโปรโมชั่นในขณะนี้</p>
            <Link href="/games" className="text-red-400 hover:underline text-sm">
              ไปเลือกเกมเติมเลย →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((p) => (
              <Link
                key={p.id}
                href={p.link_url || '/games'}
                className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-red-600/40 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-red-600/15 p-2.5 shrink-0">
                    <Tag className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.badge && (
                        <span className="rounded-full bg-red-600/20 text-red-400 text-[10px] font-semibold px-2 py-0.5">
                          {p.badge}
                        </span>
                      )}
                      <h2 className="font-semibold text-white">{p.title}</h2>
                    </div>
                    {p.description && (
                      <p className="text-sm text-zinc-400 mt-1">{p.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
