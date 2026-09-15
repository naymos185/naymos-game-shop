'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function BannerCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('/games');
  const [buttonText, setButtonText] = useState('เติมเลย');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          link_url: linkUrl,
          button_text: buttonText,
        }),
      });
      const data = await res.json();
      if (!data.success) setMsg(data.message ?? 'ไม่สำเร็จ');
      else {
        setMsg('สร้างแบนเนอร์แล้ว');
        setTitle('');
        setSubtitle('');
        router.refresh();
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-sky-100 bg-white p-5 space-y-3">
      <h2 className="font-semibold text-sm">สร้างแบนเนอร์</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="หัวข้อ"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400 sm:col-span-2"
        />
        <input
          placeholder="ข้อความรอง"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400 sm:col-span-2"
        />
        <input
          placeholder="ลิงก์ เช่น /games"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
        <input
          placeholder="ข้อความปุ่ม"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 px-4 py-2 text-sm font-bold text-slate-900 flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        สร้างแบนเนอร์
      </button>
      {msg && <p className="text-xs text-slate-500">{msg}</p>}
    </form>
  );
}
