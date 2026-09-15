'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function GameCreateForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');
  const [icon, setIcon] = useState('');
  const [authType, setAuthType] = useState<'uid' | 'id_pass'>('uid');
  const [fieldLabel, setFieldLabel] = useState('UID / OpenID');
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
          icon: icon.trim() || undefined,
          auth_type: authType,
          field_label: authType === 'uid' ? fieldLabel : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) setMsg(data.message ?? 'ไม่สำเร็จ');
      else {
        setMsg(`สร้างเกมสำเร็จ · slug: ${data.slug}`);
        setName('');
        setSlug('');
        setDescription('');
        setIcon('');
        router.refresh();
      }
    } catch {
      setMsg('เกิดข้อผิดพลาด');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-sky-100 bg-white p-5 space-y-4">
      <h2 className="font-semibold text-sm">เพิ่มเกมใหม่</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="ชื่อเกม (เช่น RoV Mobile)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
        <input
          placeholder="slug (ว่างไว้ = สร้างให้อัตโนมัติ)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm font-mono outline-none focus:border-sky-400"
        />
        <input
          placeholder="หมวดหมู่ เช่น MOBA, FPS"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
        <input
          placeholder="URL รูปภาพเกม (Image / Icon URL)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
        
        <div className="sm:col-span-2 rounded-xl border border-sky-100 bg-slate-50/60 p-3 space-y-2">
          <label className="text-xs text-slate-500 block font-medium">รูปแบบข้อมูลสำหรับเติมเกม:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700">
              <input
                type="radio"
                name="auth_type"
                value="uid"
                checked={authType === 'uid'}
                onChange={() => setAuthType('uid')}
                className="text-sky-600 focus:ring-sky-400"
              />
              ใช้ UID / OpenID
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700">
              <input
                type="radio"
                name="auth_type"
                value="id_pass"
                checked={authType === 'id_pass'}
                onChange={() => setAuthType('id_pass')}
                className="text-sky-600 focus:ring-sky-400"
              />
              ใช้ ID + Password (เข้าสู่ระบบเพื่อเติม)
            </label>
          </div>
          {authType === 'uid' && (
            <input
              placeholder="ชื่อเรียก UID เช่น UID / OpenID / เลขประจำตัวผู้เล่น"
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              className="w-full mt-2 rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
            />
          )}
        </div>

        <input
          placeholder="คำอธิบายสั้นๆ"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl border border-sky-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400 sm:col-span-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 px-4 py-2 text-sm font-bold text-slate-900 flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        บันทึกเกม
      </button>
      {msg && <p className="text-xs text-slate-500">{msg}</p>}
    </form>
  );
}
