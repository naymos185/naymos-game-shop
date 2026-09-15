'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export function BannerToggle({ id, is_active }: { id: string; is_active: boolean }) {
  const router = useRouter();
  const confirm = useConfirm();
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
      if (!res.ok) setActive(!v);
      else router.refresh();
    } catch {
      setActive(!v);
    }
    setLoading(false);
  }

  async function remove() {
    const ok = await confirm({
      title: 'ลบแบนเนอร์นี้?',
      description: 'คุณแน่ใจว่าต้องการลบแบนเนอร์นี้ออกจากหน้าร้านอย่างถาวรหรือไม่?',
      confirmText: 'ลบถาวร',
      cancelText: 'ยกเลิก',
      tone: 'danger',
    });
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/banners/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('ลบแบนเนอร์ไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    }
    setDeleting(false);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => void toggle(e.target.checked)}
          className="rounded border-zinc-600"
        />
        {active ? 'เปิด' : 'ปิด'}
        {loading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
      </label>
      <button
        type="button"
        disabled={deleting}
        onClick={remove}
        className="p-1 rounded text-sky-600 hover:text-red-300 transition"
        title="ลบแบนเนอร์"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
