'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export function MarkPaidButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkPaid() {
    const ok = await confirm({
      title: 'ยืนยันการชำระเงิน?',
      description: `ต้องการเปลี่ยนสถานะออเดอร์ ${orderNumber} เป็นชำระเงินแล้วใช่หรือไม่?`,
      confirmText: 'ยืนยันชำระเงิน',
      cancelText: 'ยกเลิก',
      tone: 'default',
    });
    if (!ok) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/orders/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'ไม่สามารถอัปเดตสถานะได้');
      } else {
        router.refresh();
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleMarkPaid}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <CheckCircle className="w-3 h-3" />
        )}
        ยืนยันชำระ
      </button>
      {error && <span className="text-[10px] text-sky-600">{error}</span>}
    </div>
  );
}
