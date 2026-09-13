'use client';

import { useState } from 'react';
import type { GameWithDetails } from '@/lib/games/queries';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function GameOrderForm({ game }: { game: GameWithDetails }) {
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pkg = game.products.find((p) => p.id === selectedPkg);

  const canSubmit =
    !loading &&
    !!selectedPkg &&
    game.game_fields.every(
      (f) => !f.required || (playerData[f.name]?.trim() ?? '') !== ''
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !pkg) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          product_id: pkg.id,
          player_data: playerData,
          contact_email: contact.email.trim() || undefined,
          contact_phone: contact.phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message ?? 'สร้างออเดอร์ไม่สำเร็จ');
        setLoading(false);
        return;
      }
      setOrderNumber(data.order.order_number);
      setOrderTotal(Number(data.order.total));
      setSubmitted(true);
    } catch {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/30 p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto">
          <Check className="h-7 w-7 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-emerald-300">สร้างออเดอร์สำเร็จ</h2>
        <p className="text-zinc-400 text-sm">
          หมายเลขออเดอร์:{' '}
          <span className="font-mono text-white font-bold text-lg">{orderNumber}</span>
        </p>
        <p className="text-sm text-zinc-300">
          ยอดชำระ <span className="text-red-400 font-bold">฿{orderTotal}</span>
        </p>
        <p className="text-sm text-zinc-500">สถานะ: รอชำระเงิน — กดปุ่มด้านล่างเพื่อไปหน้าชำระเงิน</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={`/pay/${encodeURIComponent(orderNumber)}`}
            className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition"
          >
            ไปชำระเงิน
          </Link>
          <Link
            href={`/order-tracking?number=${encodeURIComponent(orderNumber)}`}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition"
          >
            ติดตามออเดอร์
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setSelectedPkg(null);
              setPlayerData({});
              setError(null);
            }}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 text-sm text-zinc-300 transition"
          >
            สร้างออเดอร์ใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <h2 className="font-semibold mb-4">1. เลือกแพ็กเกจ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {game.products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPkg(p.id)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${
                selectedPkg === p.id
                  ? 'border-red-500 bg-red-600/10 ring-1 ring-red-500/30'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
              }`}
            >
              <span className="font-medium text-sm">{p.name}</span>
              <span className="font-bold text-red-400">฿{Number(p.price)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <h2 className="font-semibold mb-4">2. กรอกข้อมูลผู้เล่น</h2>
        <div className="space-y-4">
          {game.game_fields.map((f) => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                {f.label}
                {f.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <input
                type="text"
                placeholder={f.placeholder ?? ''}
                value={playerData[f.name] ?? ''}
                onChange={(e) =>
                  setPlayerData((prev) => ({ ...prev, [f.name]: e.target.value }))
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500 transition"
              />
            </div>
          ))}
          <div className="flex gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-200/90">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>กรุณาตรวจสอบข้อมูลให้ถูกต้อง หากกรอกผิดทางร้านไม่รับผิดชอบ</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <h2 className="font-semibold mb-4">3. ข้อมูลติดต่อ (ไม่บังคับ)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">อีเมล</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={contact.email}
              onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">เบอร์โทร</label>
            <input
              type="tel"
              placeholder="08x-xxx-xxxx"
              value={contact.phone}
              onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-2">ไม่บังคับกรอก (แนะนำกรอกเพื่อติดต่อกลับ)</p>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400 text-sm">ยอดชำระ</span>
          <span className="text-2xl font-bold text-red-400">
            ฿{pkg ? Number(pkg.price) : 0}
          </span>
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed py-3.5 font-bold text-white transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? 'กำลังสร้างออเดอร์...'
            : pkg
              ? `ยืนยันออเดอร์ — ฿${Number(pkg.price)}`
              : 'เลือกแพ็กเกจก่อน'}
        </button>
      </section>
    </form>
  );
}
