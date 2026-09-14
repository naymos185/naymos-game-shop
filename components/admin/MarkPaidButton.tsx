'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export function MarkPaidButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onClick() {
    const ok = await confirm({
      title: 'ยืนยันการชำระเงิน',
      description: `ยืนยันว่าออเดอร์ ${orderNumber} ชำระเงินเรียบร้อยแล้ว?`,
      confirmText: 'ยืนยันชำระ',
      tone: 'default',
    });
    if (!ok) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/orders/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber }),
      });
      const data = await res.json();
      if (!data.success) {
        setMsg(data.message ?? 'ไม่สำเร็จ');
      } else {
        setMsg('ยืนยันแล้ว');
        router.refresh();
      }
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
        className="rounded-lg bg-emerald-600/20 border border-emerald-600/40 px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50 transition"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'ยืนยันชำระ'}
      </button>
      {msg && <span className="text-[10px] text-zinc-500">{msg}</span>}
    </div>
  );
}
