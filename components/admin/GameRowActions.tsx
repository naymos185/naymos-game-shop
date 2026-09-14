'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Edit, X } from 'lucide-react';

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
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเกม "${name || 'นี้'}"? (ข้อมูลแพ็กเกจของเกมนี้จะถูกลบไปด้วย)`)) {
      return;
    }
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
      <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer mr-1">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => void toggle(e.target.checked)}
          className="rounded border-zinc-600"
        />
        {active ? 'เปิดขาย' : 'ปิด'}
        {loading && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
      </label>

      {/* Edit button */}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
        title="แก้ไขชื่อและรูปเกม"
      >
        <Edit className="w-3.5 h-3.5" />
      </button>

      {/* Delete button */}
      <button
        type="button"
        disabled={deleting}
        onClick={handleDelete}
        className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
        title="ลบเกม"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">แก้ไขข้อมูล / รูปเกม</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">ชื่อเกม</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">URL รูปภาพ / ไอคอนเกม</label>
                <input
                  type="text"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  placeholder="https://... หรือ /games/...jpg"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
                {editIcon && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={editIcon} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-zinc-800" />
                    <span className="text-[11px] text-zinc-400">รูปตัวอย่าง</span>
                  </div>
                )}
              </div>
            </div>

            {msg && <p className="text-xs text-red-400">{msg}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border border-zinc-700 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 py-2 text-xs font-bold text-white flex items-center justify-center gap-1.5"
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
