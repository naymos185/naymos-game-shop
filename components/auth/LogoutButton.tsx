'use client';

import { signOut } from '@/lib/auth/actions';

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={
          className ??
          'rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition'
        }
      >
        ออกจากระบบ
      </button>
    </form>
  );
}
