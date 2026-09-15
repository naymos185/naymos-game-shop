'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Check } from 'lucide-react';
import { useConfirm } from '@/components/ui/ConfirmDialog';

type Props = {
  id: string;
  name?: string;
  price: number;
  cost: number;
  reseller_price?: number | null;
  is_active: boolean;
};

export function ProductRowActions({ id, name, price, cost, reseller_price, is_active }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [p, setP] = useState(String(price));
  const [c, setC] = useState(String(cost));
  const [rp, setRp] = useState(reseller_price != null ? String(reseller_price) : '');
  const [active, setActive] = useState(is_active);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setP(String(price));
  }, [price]);

  useEffect(() => {
    setC(String(cost));
  }, [cost]);

  useEffect(() => {
    setRp(reseller_price != null ? String(reseller_price) : '');
  }, [reseller_price]);

  useEffect(() => {
    setActive(is_active);
  }, [is_active]);

  async function save(next: { price?: number; cost?: number; reseller_price?: number | null; is_active?: boolean }) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          price: next.price ?? Number(p),
          cost: next.cost ?? Number(c),
          reseller_price: next.reseller_price !== undefined ? next.reseller_price : (rp.trim() === '' ? null : Number(rp)),
          is_active: next.is_active ?? active,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message ?? 'บันทึกไม่สำเร็จ');
      } else {
        setSaved(true);
        if (next.is_active !== undefined) setActive(next.is_active);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setErrorMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  const label = name ?? 'แพ็กเกจนี้';

  async function remove() {
    const ok = await confirm({
      title: 'ลบแพ็กเกจนี้?',
      description: `"${label}" จะถูกลบออกอย่างถาวรและกู้คืนไม่ได้ หากมีออเดอร์เก่าอ้างอิงอยู่ ระบบจะแนะนำให้ปิดแพ็กแทน`,
      confirmText: 'ลบถาวร',
    });
    if (!ok) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, hard: true }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message ?? 'ลบไม่สำเร็จ');
      } else {
        router.refresh();
      }
    } catch {
      setErrorMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">ราคาปกติ</span>
          <input
            type="number"
            value={p}
            onChange={(e) => setP(e.target.value)}
            onBlur={() => {
              const n = Number(p);
              if (!Number.isNaN(n) && n >= 0 && n !== price) void save({ price: n });
            }}
            className="w-16 sm:w-20 rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-slate-900 font-medium focus:border-sky-400 focus:outline-none"
            min={0}
            step={1}
            title="ราคาปกติ"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">ต้นทุน</span>
          <input
            type="number"
            value={c}
            onChange={(e) => setC(e.target.value)}
            onBlur={() => {
              const n = Number(c);
              if (!Number.isNaN(n) && n >= 0 && n !== cost) void save({ cost: n });
            }}
            className="w-16 sm:w-20 rounded-lg border border-sky-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:border-sky-400 focus:outline-none"
            min={0}
            step={1}
            title="ต้นทุน"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-emerald-400 font-medium">ราคาส่ง</span>
          <input
            type="number"
            value={rp}
            onChange={(e) => setRp(e.target.value)}
            onBlur={() => {
              const val = rp.trim() === '' ? null : Number(rp);
              if (val !== (reseller_price ?? null)) void save({ reseller_price: val });
            }}
            className="w-16 sm:w-20 rounded-lg border border-emerald-500/40 bg-slate-50 px-2 py-1 text-xs text-emerald-400 placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none"
            min={0}
            step={1}
            placeholder="ตัวแทน"
            title="ราคาส่งตัวแทน"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 pt-3">
        <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => {
              const v = e.target.checked;
              setActive(v);
              void save({ is_active: v });
            }}
            className="rounded border-sky-200 accent-sky-500"
          />
          <span className="text-[11px]">เปิด</span>
        </label>

        <button
          type="button"
          disabled={loading}
          onClick={() => void remove()}
          title="ลบแพ็กเกจนี้"
          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-600 transition hover:bg-sky-500/20 disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" />
          ลบ
        </button>
      </div>

      {/* Fixed status indicator width so nothing shifts */}
      <div className="w-14 flex items-center justify-start shrink-0 pt-3">
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />}
        {!loading && saved && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium">
            <Check className="h-3 w-3" /> บันทึก
          </span>
        )}
        {!loading && errorMsg && (
          <span className="text-[10px] text-sky-600 truncate" title={errorMsg}>
            พลาด
          </span>
        )}
      </div>
    </div>
  );
}
