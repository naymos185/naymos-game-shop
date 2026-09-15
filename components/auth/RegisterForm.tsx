'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, CheckCircle2, Lock, Mail, User, Loader2 } from 'lucide-react';

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
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border-2 border-sky-100 bg-white p-6 sm:p-8 shadow-xl shadow-sky-100/60 space-y-4"
    >
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
      <div>
        <label className="block text-sm font-bold text-sky-950 mb-1.5 flex items-center gap-1.5">
          <User className="w-4 h-4 text-sky-500" />
          ชื่อ
        </label>
        <input
          name="full_name"
          type="text"
          placeholder="ชื่อของคุณ"
          className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-sky-950 mb-1.5 flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-sky-500" />
          อีเมล
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-sky-950 mb-1.5 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-sky-500" />
          รหัสผ่าน
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="อย่างน้อย 6 ตัวอักษร"
          className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 disabled:opacity-60 disabled:cursor-not-allowed py-3.5 font-bold text-white shadow-md shadow-sky-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-base mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>กำลังสมัคร...</span>
          </>
        ) : (
          <span>สมัครสมาชิก</span>
        )}
      </button>
    </form>
  );
}
