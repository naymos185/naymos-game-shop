'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        className ??
        'rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition disabled:opacity-50'
      }
    >
      {loading ? '...' : 'ออกจากระบบ'}
    </button>
  );
}
