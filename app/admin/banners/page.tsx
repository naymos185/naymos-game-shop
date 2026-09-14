import type { Metadata } from 'next';
import { listBannersAdmin } from '@/lib/banners/queries';
import { BannerCreateForm } from '@/components/admin/BannerCreateForm';
import { BannerToggle } from '@/components/admin/BannerToggle';

export const metadata: Metadata = { title: 'แบนเนอร์' };
export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const banners = await listBannersAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">Banners</h1>
        <p className="text-sm text-zinc-500">
          แบนเนอร์หน้าแรก · {banners.length} รายการ
        </p>
      </div>

      <BannerCreateForm />

      {banners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
          ยังไม่มีแบนเนอร์ — รัน 011_banners.sql หรือสร้างด้านบน
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium text-white text-sm">{b.title}</p>
                {b.subtitle && (
                  <p className="text-xs text-zinc-500 mt-0.5">{b.subtitle}</p>
                )}
                <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                  {b.link_url} · ปุ่ม: {b.button_text || '—'}
                </p>
              </div>
              <BannerToggle id={b.id} is_active={b.is_active} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
