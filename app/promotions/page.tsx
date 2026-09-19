import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getActivePromotions } from '@/lib/promotions/queries';
import { Tag, Sparkles, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'โปรโมชั่น | NayMos GameShop',
  description: 'โปรโมชั่นและดีลพิเศษสุดคุ้มจากร้าน NayMos GameShop',
};
export const revalidate = 60;

export default async function PromotionsPage() {
  const promotions = await getActivePromotions();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>โปรโมชั่นพิเศษ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            โปรโมชั่นทั้งหมด
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            ดีลพิเศษและโค้ดส่วนลดจาก NayMos GameShop
          </p>
        </div>

        {promotions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white/80 backdrop-blur-xs p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6" />
            </div>
            <p className="text-slate-600 font-semibold mb-3">ยังไม่มีโปรโมชั่นในขณะนี้</p>
            <Link
              href="/games"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white text-xs font-bold shadow-xs shadow-sky-200 transition"
            >
              ไปเลือกเติมเกมเลย <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {promotions.map((p) => (
              <Link
                key={p.id}
                href={p.link_url || '/games'}
                className="group block rounded-3xl border border-sky-100 bg-white p-5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 shadow-xs cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-sky-50 border border-sky-100 p-3 shrink-0 group-hover:bg-sky-100 transition-colors">
                    <Tag className="h-5 w-5 text-sky-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {p.badge && (
                        <span className="rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold px-2.5 py-0.5 shadow-2xs">
                          {p.badge}
                        </span>
                      )}
                      <h2 className="font-extrabold text-base text-slate-800 group-hover:text-sky-600 transition-colors">
                        {p.title}
                      </h2>
                    </div>
                    {p.description && (
                      <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 self-center hidden sm:block text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-5 h-5" />
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
