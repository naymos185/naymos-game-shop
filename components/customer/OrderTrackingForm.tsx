'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { orderStatusColor, orderStatusLabel } from '@/lib/orders/status';

type OrderResult = {
  order_number: string;
  status: string;
  total: number;
  game_name?: string;
  product_name?: string;
  player_data?: Record<string, unknown>;
  contact_email?: string | null;
  created_at: string;
};

export function OrderTrackingForm() {
  const searchParams = useSearchParams();
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResult | null>(null);

  useEffect(() => {
    const q = searchParams.get('number');
    if (q) {
      setNumber(q);
      void lookup(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function lookup(orderNumber: string) {
    const n = orderNumber.trim();
    if (!n) {
      setError('กรุณากรอกหมายเลขออเดอร์');
      return;
    }
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(`/api/orders?number=${encodeURIComponent(n)}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.message ?? 'ไม่พบออเดอร์');
      } else {
        setOrder(data.order);
      }
    } catch {
      setError('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void lookup(number);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="rounded-2xl border border-sky-100 bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            หมายเลขออเดอร์
          </label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value.toUpperCase())}
            placeholder="เช่น NM-20260912-XXXX"
            className="w-full rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3 text-sm font-mono outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 disabled:opacity-50 py-3 font-bold text-white transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
        </button>
      </form>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </div>
      )}

      {order && (
        <div className="rounded-2xl border border-sky-100 bg-white p-6 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500">หมายเลข</span>
            <span className="font-mono font-bold text-slate-900">{order.order_number}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500">สถานะ</span>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusColor(order.status)}`}>
              {orderStatusLabel(order.status)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500">เกม</span>
            <span className="text-slate-800">{order.game_name ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500">แพ็กเกจ</span>
            <span className="text-slate-800">{order.product_name ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500">ยอดชำระ</span>
            <span className="font-bold text-sky-600">฿{Number(order.total)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-500">สร้างเมื่อ</span>
            <span className="text-slate-600">{new Date(order.created_at).toLocaleString('th-TH')}</span>
          </div>
          {order.player_data && Object.keys(order.player_data).length > 0 && (
            <div className="pt-2 border-t border-sky-100">
              <p className="text-zinc-500 mb-2">ข้อมูลผู้เล่น</p>
              {Object.entries(order.player_data).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 py-0.5">
                  <span className="text-zinc-500">{k}</span>
                  <span className="text-slate-800 font-mono text-xs">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
