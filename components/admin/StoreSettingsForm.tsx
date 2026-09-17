'use client';

import { useState } from 'react';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';
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
      setMsg(data.success ? 'บันทึกการตั้งค่าเรียบร้อยแล้ว' : data.message ?? 'ไม่สำเร็จ');
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-2xl border border-sky-100 shadow-xs">
      <div className="space-y-4">
        <h3 className="font-bold text-base text-sky-950 pb-2 border-b border-sky-100">ข้อมูลร้านค้าและการชำระเงิน</h3>
        {(
          [
            ['name', 'ชื่อร้านค้า'],
            ['account_name', 'ชื่อบัญชี'],
            ['bank_name', 'ช่องทาง / ธนาคาร'],
            ['promptpay_id', 'เลขพร้อมเพย์'],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
            <input
              type="text"
              value={form[key] ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full rounded-xl border border-sky-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white transition"
              placeholder={label}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-4 border-t border-sky-100">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-sky-600" />
          <label className="block text-sm font-bold text-sky-950">
            ข้อตกลงและเงื่อนไขการใช้บริการ (Terms of Service)
          </label>
        </div>
        <p className="text-xs text-slate-500">
          ข้อความนี้จะแสดงใน Modal ข้อตกลงที่ลูกค้ากดอ่านก่อนสั่งซื้อ สามารถขึ้นบรรทัดใหม่หรือใส่ข้อความได้อิสระ
        </p>
        <textarea
          rows={7}
          value={form.terms_of_service ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, terms_of_service: e.target.value }))}
          className="w-full rounded-xl border border-sky-200 bg-slate-50/50 p-4 text-sm text-slate-900 leading-relaxed outline-none focus:border-sky-400 focus:bg-white transition font-sans"
          placeholder="ระบุข้อตกลงและเงื่อนไขการเติมเงิน..."
        />
      </div>

      <div className="pt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 px-6 py-2.5 text-sm font-bold text-white shadow-xs flex items-center gap-2 transition"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          บันทึกการตั้งค่า
        </button>
        {msg && (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> {msg}
          </span>
        )}
      </div>
    </form>
  );
}
