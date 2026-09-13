'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type Props = {
  id: string;
  price: number;
  cost: number;
  is_active: boolean;
};

export function ProductRowActions({ id, price, cost, is_active }: Props) {
  const router = useRouter();
  const [p, setP] = useState(String(price));
  const [c, setC] = useState(String(cost));
  const [active, setActive] = useState(is_active);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          price: Number(p),
          cost: Number(c),
          is_active: active,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMsg(data.message ?? 'ไม่สำเร็จ');
      } else {
        setMsg('บันทึกแล้ว');
        router.refresh();
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={p}
        onChange={(e) => setP(e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white"
        min={0}
        step={1}
      />
      <input
        type="number"
        value={c}
        onChange={(e) => setC(e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-300"
        min={0}
        step={1}
        title="ต้นทุน"
      />
      <label className="flex items-center gap-1 text-xs text-zinc-400">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded border-zinc-600"
        />
        เปิด
      </label>
      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="rounded-lg bg-red-600/20 border border-red-600/40 px-2 py-1 text-xs text-red-400 hover:bg-red-600/30 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'บันทึก'}
      </button>
      {msg && <span className="text-[10px] text-zinc-500">{msg}</span>}
    </div>
  );
}
