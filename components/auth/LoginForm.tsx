'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth/actions';

export function LoginForm({ next = '/account' }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    setLoading(false);
    if (!result.success) {
      setError(result.message ?? 'เข้าสู่ระบบไม่สำเร็จ');
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
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
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed py-3 font-semibold text-white transition"
      >
        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  );
}
