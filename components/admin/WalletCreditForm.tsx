'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, MinusCircle } from 'lucide-react';

export function WalletCreditForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'credit' | 'debit'>('credit');
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('แอดมินเติมเครดิต');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const switchMode = (m: 'credit' | 'debit') => {
    setMode(m);
    setReason(m === 'credit' ? 'แอดมินเติมเครดิต' : 'แอดมินตัดเครดิต');
    setMsg(null);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const endpoint = mode === 'credit' ? '/api/admin/wallet/credit' : '/api/admin/wallet/debit';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId.trim(),
          amount: Number(amount),
          reason,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMsg(data.message ?? 'ทำรายการไม่สำเร็จ');
      } else {
        const actionText = mode === 'credit' ? 'เติมเงินสำเร็จ' : 'ตัดเงินสำเร็จ';
        setMsg(`${actionText} · ยอดใหม่ ฿${Number(data.balance).toLocaleString()}`);
        setAmount('');
        router.refresh();
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">จัดการเครดิตกระเป๋า</h2>
        <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => switchMode('credit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              mode === 'credit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            เติมเครดิต
          </button>
          <button
            type="button"
            onClick={() => switchMode('debit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              mode === 'debit'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MinusCircle className="h-3.5 w-3.5" />
            ตัดเงินในกระเป๋า
          </button>
        </div>
      </div>

      <input
        required
        placeholder="User ID (UUID จาก Customers)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-mono outline-none focus:border-red-500"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          type="number"
          min={1}
          step="any"
          placeholder={mode === 'credit' ? 'จำนวนเงินที่เติม (บาท)' : 'จำนวนเงินที่ต้องการตัด (บาท)'}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          placeholder="เหตุผลประกอบ"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="submit"
          disabled={loading}
          className={`rounded-xl disabled:opacity-50 px-5 py-2 text-sm font-semibold text-white flex items-center gap-2 transition ${
            mode === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'credit' ? 'ยืนยันเติมเครดิต' : 'ยืนยันตัดเงิน'}
        </button>
        {msg && <p className="text-xs text-zinc-300 font-medium">{msg}</p>}
      </div>
    </form>
  );
}
