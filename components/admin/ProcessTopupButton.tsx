'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function ProcessTopupButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onClick() {
    if (!confirm(`รันเติมเกมสำหรับ ${orderNumber}?`)) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/orders/process-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber }),
      });
      const data = await res.json();
      setMsg(data.message ?? (data.success ? 'สำเร็จ' : 'ไม่สำเร็จ'));
      router.refresh();
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-lg bg-blue-600/20 border border-blue-600/40 px-2.5 py-1 text-xs text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 transition"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'เติมเกม'}
      </button>
      {msg && <span className="text-[10px] text-zinc-500 max-w-[120px]">{msg}</span>}
    </div>
  );
}
