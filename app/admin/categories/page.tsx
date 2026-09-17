'use client';

import { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, CheckCircle2, XCircle, ArrowUpDown, Loader2 } from 'lucide-react';
import type { ProductCategory } from '@/types/game';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating / editing
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<ProductCategory | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        setError(data.message || 'ไม่สามารถโหลดหมวดหมู่ได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openCreate() {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setSortOrder((categories.length + 1));
    setIsActive(true);
    setFormErr(null);
    setShowModal(true);
  }

  function openEdit(cat: ProductCategory) {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setSortOrder(cat.sort_order || 0);
    setIsActive(cat.is_active);
    setFormErr(null);
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormErr(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      let res;
      if (editingCat) {
        res = await fetch(`/api/admin/categories/${editingCat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchCategories();
      } else {
        setFormErr(data.message || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      setFormErr('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(cat: ProductCategory) {
    if (!confirm(`ต้องการลบหมวดหมู่ "${cat.name}" หรือไม่?\n(ระบบจะอนุญาตให้ลบเฉพาะหมวดหมู่ที่ไม่มีสินค้าใช้งานเท่านั้น)`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.message || 'ลบไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  }

  async function toggleActive(cat: ProductCategory) {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !cat.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-500" />
            <span>จัดการหมวดหมู่สินค้า (Product Categories)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            กำหนดหมวดหมู่สินค้าสำหรับแสดงในหน้าร้าน (เช่น เติมเกมแบบ UID, เติมเกมแบบ ID-Pass, ขายไอดีเกม, แอปพรีเมี่ยม)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 hover:bg-sky-600 transition"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="rounded-3xl border border-sky-100 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
            <span>กำลังโหลดข้อมูลหมวดหมู่...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            ยังไม่มีหมวดหมู่สินค้า กดปุ่ม "เพิ่มหมวดหมู่ใหม่" เพื่อเริ่มต้น
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sky-50/50 text-xs font-semibold text-slate-600 border-b border-sky-100">
                <tr>
                  <th className="px-5 py-3.5">ลำดับ</th>
                  <th className="px-5 py-3.5">ชื่อหมวดหมู่</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">คำอธิบาย</th>
                  <th className="px-5 py-3.5 text-center">สถานะ</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-sky-50/30 transition">
                    <td className="px-5 py-3.5 font-mono text-slate-500">{cat.sort_order}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{cat.name}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-sky-600">{cat.slug}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{cat.description || '-'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => toggleActive(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {cat.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>เปิดใช้งาน</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ปิดชั่วคราว</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-sky-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {editingCat ? 'แก้ไขหมวดหมู่สินค้า' : 'เพิ่มหมวดหมู่สินค้าใหม่'}
            </h3>

            {formErr && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600">
                {formErr}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อหมวดหมู่ *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น เติมเกมแบบ UID, ขายไอดีเกม, แอปพรีเมี่ยม"
                  className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Slug (URL key)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="เช่น topup-uid, game-accounts, premium-apps"
                  className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm font-mono focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบาย</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="คำอธิบายสั้นๆ ของหมวดหมู่"
                  className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ลำดับการแสดงผล</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div className="flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-sky-500 focus:ring-sky-400"
                    />
                    <span>เปิดแสดงผล</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCat ? 'บันทึกการแก้ไข' : 'สร้างหมวดหมู่'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
