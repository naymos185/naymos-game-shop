'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = e.currentTarget;
    const fullName = (form.elements.namedItem('full_name') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName || null,
            role: 'customer',
          },
          { onConflict: 'id' }
        );
      }

      if (!data.session) {
        setSuccess('สมัครสำเร็จ — ถ้าเปิด Confirm email ไว้ ให้เช็กอีเมลก่อนเข้าสู่ระบบ');
        setLoading(false);
        return;
      }

      setSuccess('สมัครสำเร็จ');
      router.push('/account');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สมัครไม่สำเร็จ');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">ชื่อ</label>
        <input
          name="full_name"
          type="text"
          placeholder="ชื่อของคุณ"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">อีเมล</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">รหัสผ่าน</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="อย่างน้อย 6 ตัวอักษร"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed py-3 font-semibold text-white transition"
      >
        {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
      </button>
    </form>
  );
}
