'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { useConfirm } from '@/components/ui/ConfirmDialog';

type Props = {
  id: string;
  name?: string;
  price: number;
  cost: number;
  is_active: boolean;
};

export function ProductRowActions({ id, name, price, cost, is_active }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [p, setP] = useState(String(price));
  const [c, setC] = useState(String(cost));
  const [active, setActive] = useState(is_active);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setP(String(price));
    setC(String(cost));
    setActive(is_active);
  }, [price, cost, is_active]);

  async function save(next: { price?: number; cost?: number; is_active?: boolean }) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          price: next.price ?? Number(p),
          cost: next.cost ?? Number(c),
          is_active: next.is_active ?? active,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMsg(data.message ?? 'ไม่สำเร็จ');
      } else {
        setMsg('บันทึกแล้ว');
        if (next.is_active !== undefined) setActive(next.is_active);
        router.refresh();
        setTimeout(() => setMsg(null), 1500);
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
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
    setMsg(null);
    try {
      const res = await fetch('/api/admin/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, hard: true }),
      });
      const data = await res.json();
      if (!data.success) {
        setMsg(data.message ?? 'ลบไม่สำเร็จ');
      } else {
        setMsg('ลบแล้ว');
        router.refresh();
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  function scheduleSave(next?: { price?: number; cost?: number; is_active?: boolean }) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void save(next ?? {});
    }, 500);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={p}
        onChange={(e) => {
          setP(e.target.value);
          const n = Number(e.target.value);
          if (!Number.isNaN(n) && n >= 0) scheduleSave({ price: n });
        }}
        onBlur={() => {
          const n = Number(p);
          if (!Number.isNaN(n) && n >= 0 && n !== price) void save({ price: n });
        }}
        className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white"
        min={0}
        step={1}
        title="ราคา"
      />
      <input
        type="number"
        value={c}
        onChange={(e) => {
          setC(e.target.value);
          const n = Number(e.target.value);
          if (!Number.isNaN(n) && n >= 0) scheduleSave({ cost: n });
        }}
        onBlur={() => {
          const n = Number(c);
          if (!Number.isNaN(n) && n >= 0 && n !== cost) void save({ cost: n });
        }}
        className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-300"
        min={0}
        step={1}
        title="ต้นทุน"
      />
      <label className="flex items-center gap-1 text-xs text-zinc-400 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => {
            const v = e.target.checked;
            setActive(v);
            void save({ is_active: v });
          }}
          className="rounded border-zinc-600"
        />
        เปิด
      </label>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          const ok = await confirm({
            title: 'ปิดการขายแพ็กนี้',
            description: `ลูกค้าจะไม่เห็น "${label}" อีก แต่ข้อมูลยังอยู่ เปิดกลับได้ทุกเมื่อ`,
            confirmText: 'ปิดแพ็ก',
          });
          if (!ok) return;
          void save({ is_active: false });
        }}
        className="text-[10px] text-zinc-500 hover:text-amber-400 underline"
      >
        ปิดแพ็ก
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => void remove()}
        title="ลบแพ็กเกจนี้"
        className="inline-flex items-center gap-1 rounded-lg border border-red-600/40 bg-red-600/10 px-2 py-1 text-[11px] text-red-400 transition hover:bg-red-600/20 disabled:opacity-50"
      >
        <Trash2 className="h-3 w-3" />
        ลบ
      </button>
      {loading && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
      {msg && <span className="text-[10px] text-zinc-500">{msg}</span>}
    </div>
  );
}
