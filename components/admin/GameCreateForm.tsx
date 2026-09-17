'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { ProductCategory } from '@/types/game';

export function GameCreateForm({ categories = [] }: { categories?: ProductCategory[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [productCategoryId, setProductCategoryId] = useState<string>('');
  const [icon, setIcon] = useState('');
  const [authType, setAuthType] = useState<'uid' | 'id_pass'>('uid');
  const [fieldLabel, setFieldLabel] = useState('UID / OpenID');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !productCategoryId) {
      setProductCategoryId(categories[0].id);
    }
  }, [categories, productCategoryId]);

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
          slug,
          description,
          product_category_id: productCategoryId || null,
          icon,
          authType,
          fieldLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'สร้างเกมไม่สำเร็จ');
      }
      setName('');
      setSlug('');
      setDescription('');
      setIcon('');
      setMsg('สร้างเกมสำเร็จ');
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xs space-y-4">
      <h2 className="text-base font-bold text-slate-800">เพิ่มรายการสินค้า / เกมใหม่</h2>
      {msg && (
        <div className={`p-3 rounded-xl text-xs font-semibold ${msg.includes('สำเร็จ') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อสินค้า / เกม *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น Free Fire, Netflix 4K"
            className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="เว้นว่างเพื่อสร้างอัตโนมัติ"
            className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm font-mono focus:border-sky-500 focus:outline-hidden"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่สินค้า (Product Category)</label>
          <select
            value={productCategoryId}
            onChange={(e) => setProductCategoryId(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden bg-white"
          >
            <option value="">-- ไม่ระบุหมวดหมู่ --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">URL รูปภาพไอคอน</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบาย</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="คำอธิบายสั้นๆ"
          className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-sky-50">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">รูปแบบการเติม</label>
          <select
            value={authType}
            onChange={(e) => {
              const v = e.target.value as 'uid' | 'id_pass';
              setAuthType(v);
              setFieldLabel(v === 'uid' ? 'UID / OpenID' : 'Username / Email');
            }}
            className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden bg-white"
          >
            <option value="uid">เติมแบบ UID (ช่องกรอกเดียว)</option>
            <option value="id_pass">เติมแบบ ID-Pass (ID + Password)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">ป้ายกำกับช่องกรอก</label>
          <input
            type="text"
            value={fieldLabel}
            onChange={(e) => setFieldLabel(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 hover:bg-sky-600 transition disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>บันทึกสินค้าใหม่</span>
      </button>
    </form>
  );
}
