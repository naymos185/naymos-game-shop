'use client';

import { useState, useEffect } from 'react';
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
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [pointsToUse, setPointsToUse] = useState('');
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [savePlayer, setSavePlayer] = useState(true);
  const [savedList, setSavedList] = useState<
    Array<{ id: string; label: string; player_data: Record<string, string> }>
  >([]);

  const pkg = game.products.find((p) => p.id === selectedPkg);
  const discount = couponDiscount + pointsDiscount;
  const displayTotal = pkg ? Math.max(0, Number(pkg.price) - discount) : 0;

  useEffect(() => {
    void fetch(`/api/saved-players?game_id=${encodeURIComponent(game.id)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.items)) setSavedList(j.items);
      })
      .catch(() => {});
  }, [game.id]);

  const canSubmit =
    !loading &&
    !!selectedPkg &&
    game.game_fields.every(
      (f) => !f.required || (playerData[f.key]?.trim() ?? '') !== ''
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
          coupon_code: couponCode.trim() || undefined,
          points_to_use: pointsToUse ? Number(pointsToUse) : undefined,
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
      if (savePlayer) {
        void fetch('/api/saved-players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: game.id,
            label: 'บัญชีหลัก',
            player_data: playerData,
          }),
        });
      }
    } catch {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <Check className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-emerald-700">สร้างออเดอร์สำเร็จ</h2>
        <p className="text-slate-500 text-sm">
          หมายเลขออเดอร์:{' '}
          <span className="font-mono text-slate-900 font-bold text-lg">{orderNumber}</span>
        </p>
        <p className="text-sm text-slate-600">
          ยอดชำระ <span className="text-blue-600 font-bold">฿{orderTotal}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={`/pay/${encodeURIComponent(orderNumber)}`}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition"
          >
            ไปชำระเงิน
          </Link>
          <Link
            href={`/order-tracking?number=${encodeURIComponent(orderNumber)}`}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition"
          >
            ติดตามออเดอร์
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-900">1. เลือกแพ็กเกจ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {game.products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPkg(p.id);
                setCouponDiscount(0);
                setPointsDiscount(0);
                setPointsToUse('');
                setCouponMsg(null);
              }}
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${
                selectedPkg === p.id
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className="font-medium text-sm text-slate-800">{p.name}</span>
              <span className="font-bold text-blue-600">฿{Number(p.price)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-900">2. กรอกข้อมูลผู้เล่น</h2>
        <div className="space-y-4">
          {game.game_fields.map((f) => (
            <div key={f.id}>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                {f.label}
                {f.required && <span className="text-blue-600 ml-0.5">*</span>}
              </label>
              {f.type === 'password' ? (
                <input
                  type="password"
                  placeholder={f.placeholder ?? ''}
                  value={playerData[f.key] ?? ''}
                  onChange={(e) =>
                    setPlayerData((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                />
              ) : f.type === 'number' ? (
                <input
                  type="number"
                  placeholder={f.placeholder ?? ''}
                  value={playerData[f.key] ?? ''}
                  onChange={(e) =>
                    setPlayerData((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                />
              ) : f.type === 'select' && f.options ? (
                <select
                  value={playerData[f.key] ?? ''}
                  onChange={(e) =>
                    setPlayerData((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                >
                  <option value="">-- เลือก {f.label} --</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={f.placeholder ?? ''}
                  value={playerData[f.key] ?? ''}
                  onChange={(e) =>
                    setPlayerData((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>กรุณาตรวจสอบข้อมูลให้ถูกต้อง</span>
          </div>
        </div>
      </section>

      {savedList.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h3 className="font-semibold mb-3 text-sm text-slate-800">ใช้บัญชีที่บันทึกไว้</h3>
          <div className="flex flex-wrap gap-2">
            {savedList.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setPlayerData(s.player_data ?? {})}
                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 hover:bg-blue-100"
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-900">3. ข้อมูลติดต่อ (ไม่บังคับ)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">อีเมล</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">เบอร์โทร</label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-900">4. โค้ดส่วนลด</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="เช่น NAYMOS10"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setCouponDiscount(0);
              setCouponMsg(null);
            }}
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-mono outline-none focus:border-blue-500"
          />
          <button
            type="button"
            disabled={!pkg || !couponCode.trim()}
            onClick={async () => {
              if (!pkg) return;
              setCouponMsg(null);
              try {
                const res = await fetch('/api/coupons/validate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ code: couponCode, subtotal: Number(pkg.price) }),
                });
                const data = await res.json();
                if (!data.success) {
                  setCouponDiscount(0);
                  setCouponMsg(data.message ?? 'ใช้คูปองไม่ได้');
                } else {
                  setCouponDiscount(Number(data.coupon.discount_amount));
                  setCouponMsg(`ลด ฿${data.coupon.discount_amount}`);
                }
              } catch {
                setCouponMsg('ตรวจสอบคูปองไม่สำเร็จ');
              }
            }}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 px-4 py-3 text-sm font-medium text-slate-800"
          >
            ใช้โค้ด
          </button>
        </div>
        {couponMsg && (
          <p className={`text-xs mt-2 ${couponDiscount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {couponMsg}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="font-semibold mb-2 text-sm text-slate-900">5. ใช้คะแนน</h2>
        <p className="text-xs text-slate-400 mb-3">10 คะแนน = ลด 1 บาท</p>
        <input
          type="number"
          min={0}
          step={10}
          placeholder="เช่น 50"
          value={pointsToUse}
          onChange={(e) => {
            setPointsToUse(e.target.value);
            setPointsDiscount(Math.floor((Number(e.target.value) || 0) / 10));
          }}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500 text-sm">ยอดชำระ</span>
          <span className="text-2xl font-bold text-blue-600">฿{displayTotal}</span>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={savePlayer}
            onChange={(e) => setSavePlayer(e.target.checked)}
            className="rounded border-slate-300"
          />
          บันทึกบัญชีเกมนี้ (สมาชิก)
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed py-3.5 font-bold text-white transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'กำลังสร้างออเดอร์...' : pkg ? `ยืนยันออเดอร์ — ฿${displayTotal}` : 'เลือกแพ็กเกจก่อน'}
        </button>
      </section>
    </form>
  );
}
