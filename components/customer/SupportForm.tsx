'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';

export function SupportForm({ defaultEmail }: { defaultEmail?: string }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, email }),
      });
      const data = await res.json();
      if (!data.success) setError(data.message ?? 'ส่งไม่สำเร็จ');
      else {
        setDone(true);
        setSubject('');
        setMessage('');
      }
    } catch {
      setError('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center text-sm text-emerald-800">
        <p className="font-bold text-emerald-700">ส่งข้อความเรียบร้อยแล้ว!</p>
        <p className="text-xs text-emerald-600 mt-1">ทีมงานจะรีบตรวจสอบและติดต่อกลับโดยเร็ว</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="inline-block mx-auto mt-4 px-4 py-1.5 rounded-full border border-emerald-200 bg-white text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
        >
          ส่งข้อความอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">อีเมลสำหรับติดต่อกลับ</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-sky-100 bg-sky-50/30 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">หัวข้อปัญหา</label>
        <input
          required
          placeholder="ระบุหัวข้อ เช่น สลิปไม่เข้า, ปัญหาการเติมเกม"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-xl border border-sky-100 bg-sky-50/30 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียด</label>
        <textarea
          required
          rows={4}
          placeholder="ระบุรายละเอียด เช่น เลขออเดอร์, เวลาที่ทำรายการ หรือข้อความแจ้งเตือน..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-sky-100 bg-sky-50/30 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 disabled:opacity-50 py-3 text-sm font-bold text-white shadow-md shadow-sky-100 flex items-center justify-center gap-2 transition active:scale-[0.99]"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        <span>ส่งข้อความแจ้งปัญหา</span>
      </button>
    </form>
  );
}
