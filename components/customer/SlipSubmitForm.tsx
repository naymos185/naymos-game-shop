'use client';

import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';

export function SlipSubmitForm({ orderNumber }: { orderNumber: string }) {
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/pay/slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          slip_note: note.trim() || null,
          slip_url: url.trim() || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMsg(data.message ?? 'ส่งไม่สำเร็จ');
        setOk(false);
      } else {
        setMsg(data.message ?? 'ส่งแล้ว');
        setOk(true);
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
      setOk(false);
    }
    setLoading(false);
  }

  if (ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        ส่งหลักฐานแล้ว — แอดมินจะตรวจสอบและยืนยันชำระให้
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm"
    >
      <div className="flex items-center gap-2 text-blue-600 mb-1">
        <Upload className="h-4 w-4" />
        <h3 className="font-semibold text-sm text-slate-800">แจ้งโอน / ส่งสลิป</h3>
      </div>
      <p className="text-xs text-slate-500">
        โอนแล้วใส่เวลาโอน + 4 ตัวท้ายบัญชี หรือวางลิงก์รูปสลิป
      </p>
      <textarea
        rows={2}
        placeholder="เช่น โอน 15:30 จากบัญชี xxx-x-x1234"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
      />
      <input
        type="url"
        placeholder="ลิงก์รูปสลิป (ไม่บังคับ)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        disabled={loading || (!note.trim() && !url.trim())}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        ส่งหลักฐานการโอน
      </button>
      {msg && !ok && <p className="text-xs text-red-500">{msg}</p>}
    </form>
  );
}
