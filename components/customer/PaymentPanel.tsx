'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Copy, Check, CreditCard } from 'lucide-react';
import { orderStatusLabel } from '@/lib/orders/status';

type PayData = {
  order_number: string;
  order_status: string;
  amount: number;
  payment_status: string;
  payment_reference: string | null;
  qr_data: string | null;
  expires_at: string | null;
  game_name?: string;
  product_name?: string;
};

export function PaymentPanel({ orderNumber }: { orderNumber: string }) {
  const [data, setData] = useState<PayData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [store, setStore] = useState({
    promptpay_id: '',
    account_name: 'NayMos GameShop',
    bank_name: 'พร้อมเพย์',
  });

  useEffect(() => {
    void load();
    void fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.settings) {
          setStore({
            promptpay_id: j.settings.promptpay_id || '',
            account_name: j.settings.account_name || 'NayMos GameShop',
            bank_name: j.settings.bank_name || 'พร้อมเพย์',
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pay?number=${encodeURIComponent(orderNumber)}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? 'โหลดข้อมูลชำระเงินไม่สำเร็จ');
      } else {
        setData(json);
      }
    } catch {
      setError('เชื่อมต่อไม่สำเร็จ');
    }
    setLoading(false);
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-zinc-400 text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        กำลังเตรียมการชำระเงิน...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-300">
        {error ?? 'ไม่พบข้อมูล'}
        <div className="mt-4">
          <Link href="/order-tracking" className="text-red-400 hover:underline">
            กลับไปติดตามออเดอร์
          </Link>
        </div>
      </div>
    );
  }

  const isPaid =
    data.order_status === 'PAID' ||
    data.order_status === 'SUCCESS' ||
    data.order_status === 'PROCESSING' ||
    data.payment_status === 'PAID';

  if (isPaid) {
    return (
      <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/30 p-8 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto">
          <Check className="h-7 w-7 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-emerald-300">ชำระเงินแล้ว</h2>
        <p className="text-sm text-zinc-400">
          ออเดอร์ <span className="font-mono text-white">{data.order_number}</span>
        </p>
        <p className="text-sm text-zinc-500">
          สถานะ: {orderStatusLabel(data.order_status)} · รอระบบเติมเกม
        </p>
        <Link
          href={`/order-tracking?number=${encodeURIComponent(data.order_number)}`}
          className="inline-flex mt-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 text-sm text-zinc-200 transition"
        >
          ดูสถานะออเดอร์
        </Link>
      </div>
    );
  }

  const promptpayId = store.promptpay_id || process.env.NEXT_PUBLIC_PROMPTPAY_ID || '';
  const accountName = store.account_name || 'NayMos GameShop';
  const bankName = store.bank_name || 'พร้อมเพย์';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <CreditCard className="h-5 w-5" />
          <h2 className="font-semibold text-white">ชำระเงินออเดอร์</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500 text-xs">หมายเลข</p>
            <p className="font-mono font-bold text-white">{data.order_number}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">ยอดชำระ</p>
            <p className="text-2xl font-bold text-red-400">฿{Number(data.amount).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">เกม</p>
            <p className="text-white">{data.game_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">แพ็กเกจ</p>
            <p className="text-white">{data.product_name ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center space-y-4">
        <p className="text-sm text-zinc-400">สแกน QR หรือโอนตามรายละเอียดด้านล่าง</p>
        <div className="mx-auto w-48 h-48 rounded-xl bg-white p-3 flex items-center justify-center">
          <div className="text-zinc-900 text-center text-xs leading-tight">
            <p className="font-bold text-sm mb-1">PromptPay QR</p>
            <p className="font-mono text-[10px] break-all opacity-70">
              {data.qr_data?.slice(0, 48) ?? 'MOCK-QR'}
            </p>
            <p className="mt-2 font-bold text-lg">฿{Number(data.amount)}</p>
            <p className="text-[10px] mt-1 text-zinc-500">Mock QR</p>
          </div>
        </div>
        {data.expires_at && (
          <p className="text-xs text-zinc-500">
            หมดอายุ: {new Date(data.expires_at).toLocaleString('th-TH')}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3 text-sm">
        <h3 className="font-semibold">รายละเอียดการโอน</h3>
        <div className="flex justify-between gap-2">
          <span className="text-zinc-500">ช่องทาง</span>
          <span className="text-white">{bankName}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-zinc-500">ชื่อบัญชี</span>
          <span className="text-white">{accountName}</span>
        </div>
        {promptpayId ? (
          <div className="flex justify-between gap-2 items-center">
            <span className="text-zinc-500">พร้อมเพย์</span>
            <button
              type="button"
              onClick={() => copyText(promptpayId)}
              className="flex items-center gap-1.5 text-white font-mono text-xs hover:text-red-400"
            >
              {promptpayId}
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : null}
        <div className="flex justify-between gap-2 items-center">
          <span className="text-zinc-500">อ้างอิง</span>
          <button
            type="button"
            onClick={() => copyText(data.order_number)}
            className="flex items-center gap-1.5 text-white font-mono text-xs hover:text-red-400"
          >
            {data.order_number}
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        {data.payment_reference && (
          <div className="flex justify-between gap-2">
            <span className="text-zinc-500">รหัสชำระ</span>
            <span className="font-mono text-xs text-zinc-300">{data.payment_reference}</span>
          </div>
        )}
        <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-2">
          โอนยอดให้ตรงเป๊ะ · หลังโอนแล้วรอแอดมินยืนยัน
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => void load()}
          className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 py-3 text-sm font-medium text-zinc-200 transition"
        >
          รีเฟรชสถานะ
        </button>
        <Link
          href={`/order-tracking?number=${encodeURIComponent(data.order_number)}`}
          className="flex-1 text-center rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300 hover:border-red-600/40 transition"
        >
          ติดตามออเดอร์
        </Link>
      </div>
    </div>
  );
}
