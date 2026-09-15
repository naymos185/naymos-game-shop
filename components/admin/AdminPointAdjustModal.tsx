'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, MinusCircle } from 'lucide-react';

export function AdminPointAdjustModal({ user }: { user: { user_id: string; full_name?: string; email?: string; balance: number } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState('');
  const [mode, setMode] = useState<'add' | 'deduct'>('deduct');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleAdjust() {
    const val = Number(points);
    if (!val || val <= 0) {
      setMsg('กรุณาระบุจำนวนคะแนนมากกว่า 0');
      return;
    }
    const finalPoints = mode === 'deduct' ? -val : val;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/points/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          points: finalPoints,
          description: reason || (mode === 'deduct' ? 'แอดมินหักพ้อย' : 'แอดมินเพิ่มพ้อย'),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOpen(false);
        setPoints('');
        setReason('');
        router.refresh();
      } else {
        setMsg(data.message || 'ปรับคะแนนไม่สำเร็จ');
      }
    } catch {
      setMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50/80 hover:bg-sky-100 px-2.5 py-1 text-xs font-medium text-slate-800 transition"
      >
        <MinusCircle className="w-3.5 h-3.5 text-sky-600" />
        ปรับ/หักพ้อย
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-sky-100 bg-slate-50 p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">จัดการพ้อยสมาชิก</h3>
              <p className="text-xs text-slate-500 mt-0.5">{user.full_name || user.email} (ปัจจุบัน: {user.balance} พ้อย)</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('deduct')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                  mode === 'deduct' ? 'bg-sky-500 text-white' : 'bg-white text-slate-500 hover:text-white'
                }`}
              >
                หักคะแนน
              </button>
              <button
                type="button"
                onClick={() => setMode('add')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                  mode === 'add' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 hover:text-white'
                }`}
              >
                เพิ่มคะแนน
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">จำนวนคะแนน</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="เช่น 50"
                className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">เหตุผล / หมายเหตุ</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="เช่น ปรับยอดผิดพลาด, แอดมินหักพ้อย"
                className="w-full rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
              />
            </div>

            {msg && <p className="text-xs text-sky-600">{msg}</p>}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-sky-200 py-2 text-xs text-slate-700 hover:bg-sky-50/80"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleAdjust}
                className={`flex-1 rounded-xl py-2 text-xs font-bold text-white flex items-center justify-center gap-1.5 ${
                  mode === 'deduct' ? 'bg-sky-500 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
