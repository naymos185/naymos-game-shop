'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { StoreSettings } from '@/lib/admin/settings';

export function StoreSettingsForm({ initial }: { initial: StoreSettings }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMsg(data.success ? 'บันทึกแล้ว' : data.message ?? 'ไม่สำเร็จ');
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
      {(
        [
          ['name', 'ชื่อร้าน'],
          ['account_name', 'ชื่อบัญชี'],
          ['bank_name', 'ช่องทาง / ธนาคาร'],
          ['promptpay_id', 'เลขพร้อมเพย์'],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="block text-sm text-zinc-400 mb-1.5">{label}</label>
          <input
            type="text"
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-red-500"
            placeholder={label}
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        บันทึกการตั้งค่า
      </button>
      {msg && <p className="text-sm text-zinc-400">{msg}</p>}
      <p className="text-xs text-zinc-600">
        ข้อมูลนี้แสดงบนหน้าชำระเงินลูกค้า · ยังไม่เชื่อมโอนเงินอัตโนมัติ
      </p>
    </form>
  );
}
