'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';
import type { ProductCategory, Game } from '@/types/game';

type Props = {
  categories: ProductCategory[];
  usage: Record<string, number>;
  games: Game[];
};

export function CategoryManager({ categories: initial, usage, games }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSort, setEditSort] = useState(0);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, sort_order: sortOrder }),
      });
      const data = await res.json();
      if (!data.success) setMessage(data.message ?? 'ไม่สำเร็จ');
      else {
        setName('');
        setDescription('');
        setSortOrder(0);
        setMessage('เพิ่มหมวดหมู่แล้ว');
        router.refresh();
      }
    } catch {
      setMessage('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  async function toggleActive(cat: ProductCategory) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, is_active: !cat.is_active }),
      });
      const data = await res.json();
      if (data.success) router.refresh();
      else setMessage(data.message);
    } catch {
      setMessage('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  async function saveEdit() {
    if (!editId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId,
          name: editName,
          description: editDesc,
          sort_order: editSort,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditId(null);
        router.refresh();
      } else setMessage(data.message);
    } catch {
      setMessage('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  async function deleteCategory(id: string) {
    if (!confirm('ยืนยันลบหมวดหมู่นี้?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) router.refresh();
      else setMessage(data.message);
    } catch {
      setMessage('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  async function assignGameCategory(gameId: string, categoryId: string | null) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/games/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gameId, product_category_id: categoryId }),
      });
      const data = await res.json();
      if (data.success) router.refresh();
      else setMessage(data.message ?? 'อัปเดตไม่สำเร็จ');
    } catch {
      setMessage('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <form onSubmit={createCategory} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> เพิ่มหมวดหมู่ใหม่
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            required
            placeholder="ชื่อหมวดหมู่ เช่น ขายไอดีเกม"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
          <input
            placeholder="คำอธิบาย (ไม่บังคับ)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
          <input
            type="number"
            placeholder="ลำดับ"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          เพิ่มหมวดหมู่
        </button>
        {message && <p className="text-xs text-zinc-400">{message}</p>}
      </form>

      {/* List */}
      <div className="rounded-xl border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-zinc-900 text-zinc-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">ชื่อ</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">ลำดับ</th>
              <th className="px-4 py-3 font-medium">ใช้งาน</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {categories.map((cat) => (
              <tr key={cat.id} className="bg-zinc-950/50 hover:bg-zinc-900/50">
                <td className="px-4 py-3 text-white font-medium">
                  {editId === cat.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{cat.slug}</td>
                <td className="px-4 py-3 text-zinc-300">
                  {editId === cat.id ? (
                    <input
                      type="number"
                      value={editSort}
                      onChange={(e) => setEditSort(Number(e.target.value))}
                      className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm w-16"
                    />
                  ) : (
                    cat.sort_order
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-300">{usage[cat.id] ?? 0} เกม</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(cat)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      cat.is_active
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {cat.is_active ? 'เปิด' : 'ปิด'}
                  </button>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {editId === cat.id ? (
                    <>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="text-xs text-green-400 hover:underline"
                      >
                        บันทึก
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="text-xs text-zinc-400 hover:underline"
                      >
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(cat.id);
                          setEditName(cat.name);
                          setEditDesc(cat.description ?? '');
                          setEditSort(cat.sort_order);
                        }}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.id)}
                        className="text-zinc-400 hover:text-red-400"
                        title={(usage[cat.id] ?? 0) > 0 ? 'มีเกมใช้งานอยู่ ลบไม่ได้' : 'ลบ'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign category to games */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <h2 className="font-semibold text-sm">กำหนดหมวดหมู่ให้เกม</h2>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {games.map((g) => (
            <div key={g.id} className="flex items-center gap-3 text-sm">
              <span className="w-40 truncate font-medium">{g.name}</span>
              <select
                value={g.product_category_id ?? ''}
                onChange={(e) =>
                  assignGameCategory(g.id, e.target.value || null)
                }
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
              >
                <option value="">— ยังไม่กำหนด —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-zinc-500">{g.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
