'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { MarkPaidButton } from '@/components/admin/MarkPaidButton';
import { ProcessTopupButton } from '@/components/admin/ProcessTopupButton';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export function AdminOrderRowActions({ order }: { order: any }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);

  const isPending = order.status === 'pending' || order.status === 'PENDING_PAYMENT';
  const isPaidOrProcessing = order.status === 'PAID' || order.status === 'PROCESSING';

  async function handleDelete() {
    if (deleting) return;
    const ok = await confirm({
      title: 'ลบออเดอร์นี้?',
      description: `คุณแน่ใจว่าต้องการลบออเดอร์ "${order.order_number}" หรือไม่? ข้อมูลการชำระเงินและรายการที่เกี่ยวข้องจะถูกลบออกอย่างถาวร`,
      confirmText: 'ลบถาวร',
      cancelText: 'ยกเลิก',
      tone: 'danger',
    });
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.message || 'ลบออเดอร์ไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isPending && <MarkPaidButton orderId={order.id} orderNumber={order.order_number} />}
      {isPaidOrProcessing && (
        <ProcessTopupButton orderId={order.id} orderNumber={order.order_number} />
      )}
      <button
        type="button"
        disabled={deleting}
        onClick={handleDelete}
        className="p-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-600/20 text-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        title="ลบออเดอร์"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
