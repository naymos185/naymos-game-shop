'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function CouponCreateForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrder, setMinOrder] = useState('0');
  const [maxUses, setMaxUses] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          description,
          discount_type: discountType,
          discount_value: Number(discountValue),
          min_order_amount: Number(minOrder) || 0,
          max_uses: maxUses === '' ? null : Number(maxUses),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMsg(data.message ?? 'ไม่สำเร็จ');
      } else {
        setMsg('สร้างคูปองแล้ว');
        setCode('');
        setDescription('');
        router.refresh();
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-sky-100 bg-white p-5 space-y-3">
      <h2 className="font-semibold text-sm">สร้างคูปองใหม่</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="โค้ด เช่น NAYMOS10"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm font-mono outline-none focus:border-sky-400"
        />
        <input
          placeholder="คำอธิบาย (ไม่บังคับ)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percent')}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        >
          <option value="fixed">ลดเป็นจำนวนเงิน (บาท)</option>
          <option value="percent">ลดเป็นเปอร์เซ็นต์ (%)</option>
        </select>
        <input
          type="number"
          required
          min={0.01}
          step="any"
          placeholder="มูลค่าส่วนลด"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
        <input
          type="number"
          min={0}
          placeholder="ยอดขั้นต่ำ"
          value={minOrder}
          onChange={(e) => setMinOrder(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
        <input
          type="number"
          min={1}
          placeholder="ใช้ได้สูงสุด (ว่าง = ไม่จำกัด)"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 px-4 py-2 text-sm font-bold text-slate-900 flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        สร้างคูปอง
      </button>
      {msg && <p className="text-xs text-slate-500">{msg}</p>}
    </form>
  );
}
