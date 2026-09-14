'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function GameCreateForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('อื่นๆ');
  const [fieldLabel, setFieldLabel] = useState('UID / Player ID');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          description,
          category,
          field_label: fieldLabel,
        }),
      });
      const data = await res.json();
      if (!data.success) setMsg(data.message ?? 'ไม่สำเร็จ');
      else {
        setMsg(`สร้างเกมแล้ว · slug: ${data.slug}`);
        setName('');
        setSlug('');
        setDescription('');
        router.refresh();
      }
    } catch {
      setMsg('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <h2 className="font-semibold text-sm">เพิ่มเกมใหม่</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="ชื่อเกม"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          placeholder="slug (ว่าง = สร้างอัตโนมัติ)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-mono outline-none focus:border-red-500"
        />
        <input
          placeholder="หมวด เช่น MOBA"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          placeholder="ชื่อช่องกรอกผู้เล่น เช่น UID"
          value={fieldLabel}
          onChange={(e) => setFieldLabel(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          placeholder="คำอธิบาย"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500 sm:col-span-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        เพิ่มเกม
      </button>
      {msg && <p className="text-xs text-zinc-400">{msg}</p>}
    </form>
  );
}
