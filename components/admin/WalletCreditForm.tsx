'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function WalletCreditForm() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('แอดมินเติมเครดิต');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/wallet/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId.trim(),
          amount: Number(amount),
          reason,
        }),
      });
      const data = await res.json();
      if (!data.success) setMsg(data.message ?? 'ไม่สำเร็จ');
      else {
        setMsg(`เติมแล้ว · ยอดใหม่ ฿${Number(data.balance).toLocaleString()}`);
        setAmount('');
        router.refresh();
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <h2 className="font-semibold text-sm">เติมเครดิตกระเป๋า</h2>
      <input
        required
        placeholder="User ID (UUID จาก Customers)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-mono outline-none focus:border-red-500"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          type="number"
          min={1}
          step="any"
          placeholder="จำนวน (บาท)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          placeholder="เหตุผล"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        เติมเครดิต
      </button>
      {msg && <p className="text-xs text-zinc-400">{msg}</p>}
    </form>
  );
}
