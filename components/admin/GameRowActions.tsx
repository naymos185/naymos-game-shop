'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Edit, X } from 'lucide-react';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export function GameRowActions({
  id,
  name,
  icon,
  is_active,
}: {
  id: string;
  name?: string;
  icon?: string | null;
  is_active: boolean;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [active, setActive] = useState(is_active);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name || '');
  const [editIcon, setEditIcon] = useState(icon || '');
  const [savingEdit, setSavingEdit] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function toggle(v: boolean) {
    setActive(v);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/games/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: v }),
      });
      const data = await res.json();
      if (!data.success) {
        setActive(!v);
      } else {
        window.location.reload();
      }
    } catch {
      setActive(!v);
    }
    setLoading(false);
  }

  async function handleSaveEdit() {
    setSavingEdit(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/games/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName, icon: editIcon }),
      });
      const data = await res.json();
      if (data.success) {
        setEditing(false);
        window.location.reload();
      } else {
        setMsg(data.message || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      setMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setSavingEdit(false);
  }

  async function handleDelete() {
    const ok = await confirm({
      title: `ลบเกม "${name || 'นี้'}"?`,
      description: 'ข้อมูลแพ็กเกจและรายการทั้งหมดของเกมนี้จะถูกลบออกอย่างถาวรและกู้คืนไม่ได้',
      confirmText: 'ลบถาวร',
      cancelText: 'ยกเลิก',
      tone: 'danger',
    });
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/games/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.message || 'ลบเกมไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    }
    setDeleting(false);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer mr-1">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => void toggle(e.target.checked)}
          className="rounded border-sky-200"
        />
        {active ? 'เปิดขาย' : 'ปิด'}
        {loading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
      </label>

      {/* Edit button */}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="p-1.5 rounded-lg border border-sky-200 bg-sky-50/80 hover:bg-sky-100 text-slate-700 hover:text-slate-800 transition"
        title="แก้ไขชื่อและรูปเกม"
      >
        <Edit className="w-3.5 h-3.5" />
      </button>

      {/* Delete button */}
      <button
        type="button"
        disabled={deleting}
        onClick={handleDelete}
        className="p-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-600/20 text-sky-600 transition"
        title="ลบเกม"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-sky-100 bg-slate-50 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">แก้ไขข้อมูล / รูปเกม</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">ชื่อเกม</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs text-slate-900 font-medium focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">URL รูปภาพ / ไอคอนเกม</label>
                <input
                  type="text"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  placeholder="https://... หรือ /games/...jpg"
                  className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs text-slate-900 font-medium focus:border-sky-400 focus:outline-none"
                />
                {editIcon && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={editIcon} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-sky-100" />
                    <span className="text-[11px] text-slate-500">รูปตัวอย่าง</span>
                  </div>
                )}
              </div>
            </div>

            {msg && <p className="text-xs text-sky-600">{msg}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border border-sky-200 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50/80"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-600 py-2 text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5"
              >
                {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
