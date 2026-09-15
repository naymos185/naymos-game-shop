'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Lock, Mail, Loader2 } from 'lucide-react';

export function LoginForm({ next = '/account' }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
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
          autoComplete="current-password"
          placeholder="••••••••"
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
            <span>กำลังเข้าสู่ระบบ...</span>
          </>
        ) : (
          <span>เข้าสู่ระบบ</span>
        )}
      </button>
    </form>
  );
}
