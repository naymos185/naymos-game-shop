'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';

export function BannerToggle({ id, is_active }: { id: string; is_active: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(is_active);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function toggle(v: boolean) {
    setActive(v);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: v }),
      });
      const data = await res.json();
      if (!data.success) setActive(!v);
      else window.location.reload();
    } catch {
      setActive(!v);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!window.confirm('คุณแน่ใจว่าต้องการลบแบนเนอร์นี้?')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/banners/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) window.location.reload();
      else alert(data.message || 'ลบไม่สำเร็จ');
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setDeleting(false);
  }

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => void toggle(e.target.checked)}
          className="rounded border-zinc-600"
        />
        {active ? 'เปิด' : 'ปิด'}
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      </label>
      <button
        type="button"
        disabled={deleting}
        onClick={handleDelete}
        className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
        title="ลบแบนเนอร์"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
