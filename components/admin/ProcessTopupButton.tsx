'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Loader2 } from 'lucide-react';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export function ProcessTopupButton({
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

  async function handleProcess() {
    const ok = await confirm({
      title: 'รันเติมเกม?',
      description: `ต้องการเริ่มกระบวนการเติมเกมสำหรับออเดอร์ ${orderNumber} ทันทีใช่หรือไม่?`,
      confirmText: 'เริ่มเติมเกม',
      cancelText: 'ยกเลิก',
      tone: 'default',
    });
    if (!ok) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/orders/process-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'ไม่สามารถทำรายการได้');
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
        onClick={handleProcess}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Play className="w-3 h-3" />
        )}
        รันเติมเกม
      </button>
      {error && <span className="text-[10px] text-sky-600">{error}</span>}
    </div>
  );
}
