'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function CustomerRoleSelect({ userId, initialRole }: { userId: string; initialRole: string }) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);

  async function handleChange(newRole: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setRole(newRole);
        router.refresh();
      } else {
        alert(data.message || 'เปลี่ยนบทบาทไม่สำเร็จ');
      }
    } catch {
      alert('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        disabled={loading || role === 'super_admin'}
        onChange={(e) => void handleChange(e.target.value)}
        className={`rounded-lg border px-2 py-1 text-xs font-medium focus:outline-none ${
          role === 'reseller'
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
            : role === 'admin'
            ? 'border-red-500/50 bg-red-500/10 text-red-400'
            : 'border-zinc-700 bg-zinc-900 text-zinc-300'
        }`}
      >
        <option value="customer" className="bg-zinc-950 text-white">ลูกค้าทั่วไป (Customer)</option>
        <option value="reseller" className="bg-zinc-950 text-emerald-400">ตัวแทนจำหน่าย (Reseller)</option>
        <option value="admin" className="bg-zinc-950 text-red-400">ผู้ดูแลระบบ (Admin)</option>
      </select>
      {loading && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
    </div>
  );
}
