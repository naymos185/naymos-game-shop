'use client';

import { useState } from 'react';
import type { MockGame } from '@/lib/data/games';
import { Check, AlertCircle } from 'lucide-react';

export function GameOrderForm({ game }: { game: MockGame }) {
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const pkg = game.packages.find((p) => p.id === selectedPkg);

  const canSubmit =
    selectedPkg &&
    game.fields.every((f) => !f.required || (playerData[f.name]?.trim() ?? '') !== '') &&
    (contact.email.trim() !== '' || contact.phone.trim() !== '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !pkg) return;
    const num = `NM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setOrderNumber(num);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/30 p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto">
          <Check className="h-7 w-7 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-emerald-300">สร้างออเดอร์สำเร็จ (Mock)</h2>
        <p className="text-zinc-400 text-sm">
          หมายเลขออเดอร์: <span className="font-mono text-white font-bold">{orderNumber}</span>
        </p>
        <p className="text-sm text-zinc-500">
          Phase 1 — ยังไม่เชื่อม Payment จริง<br />
          ระบบชำระเงิน + เติมอัตโนมัติจะพร้อมใน Phase 6–7
        </p>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-left text-sm space-y-1">
          <p><span className="text-zinc-500">เกม:</span> {game.name}</p>
          <p><span className="text-zinc-500">แพ็ก:</span> {pkg?.name}</p>
          <p><span className="text-zinc-500">ราคา:</span> ฿{pkg?.price}</p>
          {Object.entries(playerData).map(([k, v]) => (
            <p key={k}><span className="text-zinc-500">{k}:</span> {v}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setSelectedPkg(null);
            setPlayerData({});
          }}
          className="text-sm text-red-400 hover:underline"
        >
          สร้างออเดอร์ใหม่
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <h2 className="font-semibold mb-4">1. เลือกแพ็กเกจ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {game.packages.map((p) => (
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
              <span className="font-bold text-red-400">฿{p.price}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <h2 className="font-semibold mb-4">2. กรอกข้อมูลผู้เล่น</h2>
        <div className="space-y-4">
          {game.fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                {f.label}
                {f.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <input
                type="text"
                placeholder={f.placeholder}
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
        <h2 className="font-semibold mb-4">3. ข้อมูลติดต่อ (Guest)</h2>
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
        <p className="text-xs text-zinc-500 mt-2">กรอกอย่างน้อย 1 ช่อง เพื่อรับหมายเลขออเดอร์</p>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400 text-sm">ยอดชำระ</span>
          <span className="text-2xl font-bold text-red-400">฿{pkg?.price ?? 0}</span>
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed py-3.5 font-bold text-white transition"
        >
          {pkg ? `ยืนยันออเดอร์ — ฿${pkg.price}` : 'เลือกแพ็กเกจก่อน'}
        </button>
        <p className="text-xs text-zinc-500 text-center mt-3">
          Phase 1: สร้างออเดอร์แบบ Mock · ชำระเงินจริงใน Phase 6
        </p>
      </section>
    </form>
  );
}
