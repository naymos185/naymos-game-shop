'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function PromotionCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [linkUrl, setLinkUrl] = useState('/games');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, badge, link_url: linkUrl }),
      });
      const data = await res.json();
      if (!data.success) setMsg(data.message ?? 'ไม่สำเร็จ');
      else {
        setMsg('สร้างโปรแล้ว');
        setTitle('');
        setDescription('');
        setBadge('');
        router.refresh();
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <h2 className="font-semibold text-sm">สร้างโปรโมชัน</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="หัวข้อ"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500 sm:col-span-2"
        />
        <input
          placeholder="รายละเอียด"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500 sm:col-span-2"
        />
        <input
          placeholder="ป้าย เช่น ใหม่ / ฮอต"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          placeholder="ลิงก์ เช่น /games"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        สร้างโปร
      </button>
      {msg && <p className="text-xs text-zinc-400">{msg}</p>}
    </form>
  );
}
