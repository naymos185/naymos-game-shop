'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function GameRowActions({
  id,
  is_active,
}: {
  id: string;
  is_active: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(is_active);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function toggle(v: boolean) {
    setActive(v);
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/games/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: v }),
      });
      const data = await res.json();
      if (!data.success) {
        setActive(!v);
        setMsg(data.message ?? 'ไม่สำเร็จ');
      } else {
        setMsg('บันทึกแล้ว');
        router.refresh();
        setTimeout(() => setMsg(null), 1500);
      }
    } catch {
      setActive(!v);
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => void toggle(e.target.checked)}
          className="rounded border-zinc-600"
        />
        {active ? 'เปิดขาย' : 'ปิด'}
      </label>
      {loading && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
      {msg && <span className="text-[10px] text-zinc-500">{msg}</span>}
    </div>
  );
}
