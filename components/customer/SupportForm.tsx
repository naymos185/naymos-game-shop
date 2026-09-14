'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
      <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-6 text-center text-sm text-emerald-300">
        ส่งข้อความแล้ว ทีมงานจะติดต่อกลับ
        <button
          type="button"
          onClick={() => setDone(false)}
          className="block mx-auto mt-3 text-xs text-zinc-400 hover:text-white"
        >
          ส่งอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <input
        type="email"
        placeholder="อีเมลติดต่อ"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-red-500"
      />
      <input
        required
        placeholder="หัวข้อ"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-red-500"
      />
      <textarea
        required
        rows={4}
        placeholder="รายละเอียดปัญหา"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-red-500 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        ส่งข้อความ
      </button>
    </form>
  );
}
