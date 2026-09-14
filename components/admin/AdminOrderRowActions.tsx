'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { MarkPaidButton } from '@/components/admin/MarkPaidButton';
import { ProcessTopupButton } from '@/components/admin/ProcessTopupButton';

export function AdminOrderRowActions({ order }: { order: any }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const isPending = order.status === 'pending' || order.status === 'PENDING_PAYMENT';
  const isPaidOrProcessing = order.status === 'PAID' || order.status === 'PROCESSING';

  async function handleDelete() {
    if (deleting) return; // Prevent double click
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบออเดอร์ ${order.order_number}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
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
        className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        title="ลบออเดอร์"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
