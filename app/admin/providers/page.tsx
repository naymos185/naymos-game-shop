import type { Metadata } from 'next';
import { providerManager } from '@/lib/providers/provider-manager';

export const metadata: Metadata = { title: 'Providers' };
export const dynamic = 'force-dynamic';

export default function AdminProvidersPage() {
  const providers = providerManager.getAll();
  const defaultId = providerManager.getDefault().id;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Providers</h1>
        <p className="text-sm text-zinc-500">
          ผู้ให้บริการเติมเกม · ปัจจุบันใช้ Mock สำหรับทดสอบ
        </p>
      </div>

      <div className="space-y-3">
        {providers.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-white text-sm">{p.name}</p>
              <p className="text-xs text-zinc-500 font-mono">{p.id}</p>
            </div>
            <div className="flex items-center gap-2">
              {p.id === defaultId && (
                <span className="rounded-full bg-emerald-600/20 text-emerald-400 text-[10px] px-2 py-0.5">
                  default
                </span>
              )}
              <span className="rounded-full bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5">
                mock
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600 mt-6">
        เชื่อม API จริงภายหลังที่ lib/providers — โครงสร้าง ProviderManager พร้อมแล้ว
      </p>
    </div>
  );
}
