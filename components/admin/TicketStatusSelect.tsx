'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TicketStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [loading, setLoading] = useState(false);

  async function onChange(v: string) {
    setValue(v);
    setLoading(true);
    try {
      await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: v }),
      });
      router.refresh();
    } catch {
      setValue(status);
    }
    setLoading(false);
  }

  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => void onChange(e.target.value)}
      className="rounded-lg border border-sky-200 bg-white px-2 py-1 text-xs text-slate-900 font-medium"
    >
      <option value="open">open</option>
      <option value="in_progress">in_progress</option>
      <option value="closed">closed</option>
    </select>
  );
}
