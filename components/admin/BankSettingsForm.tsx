'use client';

import { useState } from 'react';
import { Loader2, Landmark, Check, QrCode, AlertCircle } from 'lucide-react';
import type { StoreSettings } from '@/lib/admin/settings';

export function BankSettingsForm({ initial }: { initial: StoreSettings }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      if (data.success) {
        setMsg({ type: 'success', text: 'บันทึกข้อมูลธนาคารและ QR Code สำเร็จแล้ว!' });
      } else {
        setMsg({ type: 'error', text: data.message || 'บันทึกไม่สำเร็จ' });
      }
    } catch {
      setMsg({ type: 'error', text: 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ' });
    }
    setLoading(false);
  }

  const previewQr = form.promptpay_id.trim()
    ? `https://promptpay.io/${encodeURIComponent(form.promptpay_id.trim())}/100.png`
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-sky-500" />
            ช่องทาง / ธนาคาร
          </label>
          <input
            type="text"
            required
            value={form.bank_name}
            onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
            className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-sky-400 focus:bg-white outline-none transition"
            placeholder="เช่น พร้อมเพย์, กสิกรไทย, ไทยพาณิชย์"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            เลขพร้อมเพย์ / เบอร์โทรศัพท์ / เลขบัตรประชาชน / เลขบัญชี
          </label>
          <input
            type="text"
            required
            value={form.promptpay_id}
            onChange={(e) => setForm((f) => ({ ...f, promptpay_id: e.target.value }))}
            className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm font-mono font-bold text-slate-800 focus:border-sky-400 focus:bg-white outline-none transition"
            placeholder="เช่น 0812345678 หรือ 1400000000000"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            * ระบบจะนำเลขนี้ไปสร้าง PromptPay QR Code ให้ลูกค้าสแกนจ่ายเงินโดยตรง
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            ชื่อบัญชี / ชื่อผู้รับเงิน
          </label>
          <input
            type="text"
            required
            value={form.account_name}
            onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))}
            className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-sky-400 focus:bg-white outline-none transition"
            placeholder="เช่น บจก. เนย์มอส เกมช็อป หรือ นาย ก."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            ชื่อร้านค้า
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-sky-400 focus:bg-white outline-none transition"
            placeholder="NayMos GameShop"
          />
        </div>

        {msg && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-semibold flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {msg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 disabled:opacity-50 px-6 py-3 font-bold text-white shadow-md shadow-sky-200 flex items-center gap-2 text-sm transition"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          บันทึกบัญชีธนาคาร
        </button>
      </form>

      {/* Realtime QR Preview Box */}
      <div className="rounded-3xl border border-sky-200 bg-sky-50/50 p-6 flex flex-col items-center text-center space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
          <QrCode className="w-4 h-4" />
          ตัวอย่าง QR Code ที่ลูกค้าจะเห็น (ทดสอบ 100 บาท)
        </div>

        <div className="p-3 bg-white rounded-2xl border border-sky-200 shadow-sm">
          {previewQr ? (
            <img
              src={previewQr}
              alt="Preview QR"
              className="w-52 h-52 object-contain rounded-xl"
            />
          ) : (
            <div className="w-52 h-52 flex flex-col items-center justify-center text-slate-400 text-xs">
              <QrCode className="w-12 h-12 mb-2 stroke-1" />
              กรอกเลขพร้อมเพย์เพื่อดูตัวอย่าง QR
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-black text-slate-800">{form.bank_name || 'พร้อมเพย์'}</p>
          <p className="text-xs font-bold text-sky-600">{form.account_name || 'ชื่อบัญชี'}</p>
          <p className="text-xs font-mono text-slate-500">เลขบัญชี: {form.promptpay_id || '-'}</p>
        </div>
      </div>
    </div>
  );
}
