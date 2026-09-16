'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { GameFieldEditor } from './GameFieldEditor';
import type { GameField, ProductCategory } from '@/types/game';

type Props = {
  categories?: ProductCategory[];
};

export function GameCreateForm({ categories = [] }: Props) {
  const router = useRouter();
  const [ชื่อเกม, setชื่อเกม] = useState('');
  const [slug, setSlug] = useState('');
  const [คำอธิบาย, setคำอธิบาย] = useState('');
  const [หมวด, setหมวด] = useState('อื่นๆ');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [fields, setFields] = useState<GameField[]>([]);
  const [กำลังส่ง, setกำลังส่ง] = useState(false);
  const [ข้อความ, setข้อความ] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setกำลังส่ง(true);
    setข้อความ(null);
    try {
      const res = await fetch('/api/admin/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ชื่อเกม,
          slug: slug || undefined,
          description: คำอธิบาย,
          category: หมวด,
          product_category_id: productCategoryId || null,
          game_fields: fields.map((f) => ({
            key: f.key,
            label: f.label,
            type: f.type,
            placeholder: f.placeholder,
            required: f.required,
            sort_order: f.sort_order,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) setข้อความ(data.message ?? 'ไม่สำเร็จ');
      else {
        setข้อความ(`สร้างเกมแล้ว · slug: ${data.slug}`);
        setชื่อเกม('');
        setSlug('');
        setคำอธิบาย('');
        setหมวด('อื่นๆ');
        setProductCategoryId('');
        setFields([]);
        router.refresh();
      }
    } catch {
      setข้อความ('เชื่อมต่อไม่สำเร็จ');
    }
    setกำลังส่ง(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
      <h2 className="font-semibold text-sm">เพิ่มเกมใหม่</h2>

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="ชื่อเกม"
          value={ชื่อเกม}
          onChange={(e) => setชื่อเกม(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <input
          placeholder="slug (ว่าง = สร้างอัตโนมัติ)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-mono outline-none focus:border-red-500"
        />
        <input
          placeholder="หมวด Genre เช่น MOBA (Legacy)"
          value={หมวด}
          onChange={(e) => setหมวด(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
        <select
          value={productCategoryId}
          onChange={(e) => setProductCategoryId(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
        >
          <option value="">— Product Category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="คำอธิบาย"
          value={คำอธิบาย}
          onChange={(e) => setคำอธิบาย(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500 sm:col-span-2"
        />
      </div>

      <GameFieldEditor gameId="new" fields={fields} onChange={setFields} />

      <button
        type="submit"
        disabled={กำลังส่ง}
        className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"
      >
        {กำลังส่ง && <Loader2 className="h-4 w-4 animate-spin" />}
        เพิ่มเกม
      </button>
      {ข้อความ && <p className="text-xs text-zinc-400">{ข้อความ}</p>}
    </form>
  );
}
