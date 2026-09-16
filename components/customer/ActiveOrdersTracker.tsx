'use client';

import { PromptPayQRCard } from './PromptPayQRCard';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, QrCode, CheckCircle2, Clock, UploadCloud, X, ArrowRight, Ban } from 'lucide-react';
import Link from 'next/link';

export interface ActiveOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  game_name?: string;
  product_name?: string;
  player_data?: Record<string, unknown>;
}

const storeInfo = {
  promptpay_id: process.env.NEXT_PUBLIC_PROMPTPAY_ID || "",
  account_name: "NayMos GameShop",
  bank_name: "พร้อมเพย์",
};

export function ActiveOrdersTracker({ initialOrders }: { initialOrders: ActiveOrder[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState<ActiveOrder[]>(initialOrders);
  const [payingOrder, setPayingOrder] = useState<ActiveOrder | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [submittingSlip, setSubmittingSlip] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<ActiveOrder | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle slip file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      const reader = new FileReader();
      reader.onload = () => setSlipPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Submit slip to change status to PROCESSING (รอดำเนินการเติม)
  const handleSubmitSlip = async () => {
    if (!payingOrder || !slipFile) return;
    setSubmittingSlip(true);
    setMsg(null);
    try {
      const res = await fetch('/api/orders/pay-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: payingOrder.order_number,
          slip_image: slipPreview,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === payingOrder.id ? { ...o, status: 'PROCESSING' } : o))
        );
        setPayingOrder(null);
        setSlipFile(null);
        setSlipPreview(null);
        router.refresh();
      } else {
        setMsg(data.message || 'ส่งสลิปไม่สำเร็จ');
      }
    } catch {
      setMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setSubmittingSlip(false);
  };

  // Cancel pending order
  const handleCancelOrder = async (order: ActiveOrder) => {
    setCancellingId(order.id);
    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: order.order_number }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
        setOrderToCancel(null);
        router.refresh();
      } else {
        alert(data.message || 'ยกเลิกออเดอร์ไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setCancellingId(null);
  };

  // Confirm completed order -> archives order out of tracking page to history
  const handleConfirmComplete = async (order: ActiveOrder) => {
    setConfirmingId(order.id);
    try {
      const res = await fetch('/api/orders/confirm-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: order.order_number }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
        router.refresh();
      } else {
        alert(data.message || 'ยืนยันไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setConfirmingId(null);
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-sky-100 bg-white/90 p-10 text-center shadow-xs">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-100/70 text-sky-600 flex items-center justify-center mb-4 shadow-inner">
          <Clock className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-1.5">ไม่มีออเดอร์ที่รอดำเนินการ</h3>
        <p className="text-sm text-slate-500 font-medium mb-6 max-w-md mx-auto leading-relaxed">
          คุณไม่มีคำสั่งซื้อที่ค้างอยู่ หรือออเดอร์ได้รับการยืนยันและย้ายไปที่หน้าประวัติแล้ว
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/games"
            className="rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-200/50 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            เลือกเติมเกมเลย
          </Link>
          <Link
            href="/account/orders"
            className="rounded-full border border-sky-200 bg-white hover:bg-sky-50 px-6 py-2.5 text-sm font-semibold text-sky-700 shadow-2xs transition hover:scale-[1.02] active:scale-[0.98]"
          >
            ดูประวัติทั้งหมด
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const isWaitingPayment = o.status === 'pending' || o.status === 'PENDING_PAYMENT';
        const isProcessing = o.status === 'PAID' || o.status === 'PROCESSING';
        const isCompleted = o.status === 'SUCCESS' || o.status === 'completed';

        return (
          <div
            key={o.id}
            className="rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-lg transition-all hover:border-sky-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Status Badges */}
                  {isWaitingPayment && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      รอชำระเงิน
                    </span>
                  )}
                  {isProcessing && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/40 px-3 py-1 text-xs font-semibold text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      รอดำเนินการเติม
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      เติมเสร็จแล้ว
                    </span>
                  )}
                  <span className="font-mono text-sm font-bold text-slate-800 tracking-wide">
                    {o.order_number}
                  </span>
                </div>

                <p className="text-sm">
                  <span className="font-bold text-slate-900">{o.game_name || 'เกม'}</span> · <span className="font-medium text-slate-600">{o.product_name || 'แพ็กเกจ'}</span>
                </p>

                <p suppressHydrationWarning className="text-xs text-zinc-500">
                  เวลาสั่งซื้อ: {mounted ? new Date(o.created_at).toLocaleString('th-TH') : 'กำลังโหลดเวลา...'}
                </p>
              </div>

              {/* Action buttons & Price */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t border-sky-100/80 sm:border-0">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-zinc-500 block">ยอดรวม</span>
                  <span className="text-lg font-black text-sky-600">฿{Number(o.total).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isWaitingPayment && (
                    <>
                      <button
                        type="button"
                        disabled={cancellingId === o.id}
                        onClick={() => setOrderToCancel(o)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 px-3 py-2 text-xs font-medium text-sky-600 transition"
                      >
                        {cancellingId === o.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            ยกเลิกออเดอร์
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPayingOrder(o);
                          setSlipFile(null);
                          setSlipPreview(null);
                          setMsg(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-black transition shadow"
                      >
                        <QrCode className="w-4 h-4" />
                        ชำระเงิน
                      </button>
                    </>
                  )}

                  {isProcessing && (
                    <span className="inline-block text-xs font-medium text-slate-500 bg-sky-50 rounded-lg px-3 py-1.5">
                      กำลังเติม กรุณารอสักครู่...
                    </span>
                  )}

                  {isCompleted && (
                    <button
                      type="button"
                      disabled={confirmingId === o.id}
                      onClick={() => handleConfirmComplete(o)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white transition shadow"
                    >
                      {confirmingId === o.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          ยืนยันรับสินค้า
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* QR & Slip Upload Modal (Sky-Blue & White Theme) */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto overscroll-contain rounded-3xl border border-sky-100 bg-white p-4 sm:p-6 shadow-2xl space-y-4 text-center my-auto">
            <button
              type="button"
              onClick={() => setPayingOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-sky-50 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200/60">
                สแกนชำระเงิน
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">พร้อมเพย์ / QR Payment</h3>
              <p className="text-xs text-slate-500 font-mono">
                ออเดอร์: <span className="font-bold text-slate-800">{payingOrder.order_number}</span>
              </p>
            </div>

            {/* QR Code */}
            <PromptPayQRCard
              amount={Number(payingOrder.total)}
              orderNumber={payingOrder.order_number}
              promptpayId="0988251064"
              accountName="ศักดาวิชญ์ คำใจ"
              bankName="พร้อมเพย์"
            />

            <div className="text-center py-1">
              <p className="text-xs font-semibold text-slate-500">ยอดชำระสุทธิ</p>
              <p className="text-3xl font-black text-sky-600">฿{Number(payingOrder.total).toLocaleString()} <span className="text-base font-bold text-slate-600">บาท</span></p>
            </div>

            {/* Slip Upload Box */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-700">
                แนบรูปภาพสลิปการโอนเงิน (จำเป็น)
              </label>
              <div className="relative border-2 border-dashed border-sky-200 hover:border-sky-400 rounded-2xl p-4 text-center cursor-pointer transition bg-sky-50/30 hover:bg-sky-50/70">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {slipPreview ? (
                  <div className="flex items-center justify-center gap-3">
                    <img src={slipPreview} alt="Slip Preview" className="w-12 h-12 object-cover rounded-xl border border-sky-200 shadow-xs" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-emerald-600">เลือกรูปสลิปแล้ว</p>
                      <p className="text-[10px] text-slate-400">คลิกเพื่อเปลี่ยนรูป</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-600">
                    <UploadCloud className="w-6 h-6 text-sky-500" />
                    <span className="text-xs font-bold text-slate-700">กดเพื่อเลือกรูปภาพสลิปจากเครื่อง</span>
                    <span className="text-[10px] text-slate-400">รองรับไฟล์ JPG, PNG</span>
                  </div>
                )}
              </div>
            </div>

            {msg && <p className="text-center text-xs font-bold text-rose-500">{msg}</p>}

            {/* Submit & Close buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!slipFile || submittingSlip}
                onClick={handleSubmitSlip}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-40 py-3.5 text-sm font-bold text-white transition shadow-md shadow-sky-500/20"
              >
                {submittingSlip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังอัปโหลดสลิป...</span>
                  </>
                ) : (
                  <>
                    <span>ยืนยันการชำระเงิน</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setPayingOrder(null)}
                className="shrink-0 rounded-2xl border border-sky-200 bg-white hover:bg-sky-50 text-slate-600 py-3.5 px-4 text-sm font-bold transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal (Custom Cute Blue/White Modal) */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
              <Ban className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ยืนยันการยกเลิกคำสั่งซื้อ</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อ{' '}
                <span className="font-mono font-bold text-slate-800">{orderToCancel.order_number}</span>?
                <br />
                เมื่อยกเลิกแล้วจะไม่สามารถกู้คืนได้
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={cancellingId === orderToCancel.id}
                onClick={() => setOrderToCancel(null)}
                className="flex-1 rounded-full border border-sky-200 bg-sky-50/60 hover:bg-sky-100 py-2.5 text-xs font-bold text-slate-700 transition"
              >
                ไม่ยกเลิก
              </button>
              <button
                type="button"
                disabled={cancellingId === orderToCancel.id}
                onClick={() => handleCancelOrder(orderToCancel)}
                className="flex-1 rounded-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 disabled:opacity-50 py-2.5 text-xs font-bold text-white transition shadow-sm shadow-rose-500/20 flex items-center justify-center gap-1.5"
              >
                {cancellingId === orderToCancel.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังยกเลิก...</span>
                  </>
                ) : (
                  'ยืนยันยกเลิก'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
