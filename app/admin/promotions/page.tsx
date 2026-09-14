import type { Metadata } from 'next';
import { listPromotionsAdmin } from '@/lib/promotions/queries';
import { PromotionCreateForm } from '@/components/admin/PromotionCreateForm';
import { PromotionToggle } from '@/components/admin/PromotionToggle';

export const metadata: Metadata = { title: 'โปรโมชัน' };
export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  const promotions = await listPromotionsAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Promotions</h1>
        <p className="text-sm text-zinc-500">
          โปรโมชันหน้าเว็บ · {promotions.length} รายการ
        </p>
      </div>

      <PromotionCreateForm />

      {promotions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
          ยังไม่มีโปร — รัน 010_promotions.sql หรือสร้างด้านบน
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  {p.badge && (
                    <span className="rounded-full bg-red-600/20 text-red-400 text-[10px] px-2 py-0.5">
                      {p.badge}
                    </span>
                  )}
                  <p className="font-medium text-white text-sm">{p.title}</p>
                </div>
                {p.description && (
                  <p className="text-xs text-zinc-500 mt-0.5">{p.description}</p>
                )}
                {p.link_url && (
                  <p className="text-[10px] text-zinc-600 mt-1 font-mono">{p.link_url}</p>
                )}
              </div>
              <PromotionToggle id={p.id} is_active={p.is_active} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
