'use client';

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

export function ActiveOrdersTracker({ initialOrders }: { initialOrders: ActiveOrder[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState<ActiveOrder[]>(initialOrders);
  const [payingOrder, setPayingOrder] = useState<ActiveOrder | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [submittingSlip, setSubmittingSlip] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
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
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อ ${order.order_number}?`)) {
      return;
    }
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
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">ไม่มีออเดอร์ที่รอดำเนินการ</h3>
        <p className="text-sm text-zinc-400 mb-6">
          คุณไม่มีคำสั่งซื้อที่ค้างอยู่ หรือออเดอร์ได้รับการยืนยันและย้ายไปที่หน้าประวัติแล้ว
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/games"
            className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition"
          >
            เลือกเติมเกมเลย
          </Link>
          <Link
            href="/account/orders"
            className="rounded-xl border border-zinc-700 hover:bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 transition"
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
            className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-lg transition-all hover:border-zinc-700"
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
                  <span className="font-mono text-sm font-bold text-white tracking-wide">
                    {o.order_number}
                  </span>
                </div>

                <p className="text-sm font-medium text-zinc-200">
                  {o.game_name || 'เกม'} · <span className="text-zinc-400">{o.product_name || 'แพ็กเกจ'}</span>
                </p>

                <p suppressHydrationWarning className="text-xs text-zinc-500">
                  เวลาสั่งซื้อ: {mounted ? new Date(o.created_at).toLocaleString('th-TH') : 'กำลังโหลดเวลา...'}
                </p>
              </div>

              {/* Action buttons & Price */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t border-zinc-800/80 sm:border-0">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-zinc-500 block">ยอดรวม</span>
                  <span className="text-lg font-black text-red-400">฿{Number(o.total).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isWaitingPayment && (
                    <>
                      <button
                        type="button"
                        disabled={cancellingId === o.id}
                        onClick={() => handleCancelOrder(o)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 px-3 py-2 text-xs font-medium text-red-400 transition"
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
                    <span className="inline-block text-xs font-medium text-zinc-400 bg-zinc-800/80 rounded-lg px-3 py-1.5">
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

      {/* QR & Slip Upload Modal */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setPayingOrder(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">สแกนชำระเงิน</span>
              <h3 className="text-xl font-black text-white">พร้อมเพย์ / QR Payment</h3>
              <p className="text-xs text-zinc-400 font-mono">ออเดอร์: {payingOrder.order_number}</p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white mx-auto w-fit shadow-inner">
              <img
                src={`https://promptpay.io/0812345678/${payingOrder.total}.png`}
                alt="QR Code"
                className="w-48 h-48 object-contain"
              />
              <span className="text-[11px] font-bold text-zinc-800 mt-1">PromptPay QR</span>
            </div>

            <div className="text-center">
              <p className="text-xs text-zinc-400">ยอดชำระสุทธิ</p>
              <p className="text-2xl font-black text-red-400">฿{Number(payingOrder.total).toLocaleString()} บาท</p>
            </div>

            {/* Slip Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                แนบรูปภาพสลิปการโอนเงิน (จำเป็น)
              </label>
              <div className="relative border-2 border-dashed border-zinc-700 hover:border-amber-500/80 rounded-2xl p-4 text-center cursor-pointer transition bg-zinc-900/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {slipPreview ? (
                  <div className="flex items-center justify-center gap-3">
                    <img src={slipPreview} alt="Slip Preview" className="w-12 h-12 object-cover rounded-lg border border-zinc-700" />
                    <div className="text-left">
                      <p className="text-xs font-medium text-emerald-400">เลือกรูปสลิปแล้ว</p>
                      <p className="text-[10px] text-zinc-500">คลิกเพื่อเปลี่ยนรูป</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                    <UploadCloud className="w-6 h-6 text-amber-400" />
                    <span className="text-xs font-medium">กดเพื่อเลือกรูปภาพสลิปจากเครื่อง</span>
                    <span className="text-[10px] text-zinc-500">รองรับไฟล์ JPG, PNG</span>
                  </div>
                )}
              </div>
            </div>

            {msg && <p className="text-center text-xs text-red-400">{msg}</p>}

            {/* Submit button */}
            <button
              type="button"
              disabled={!slipFile || submittingSlip}
              onClick={handleSubmitSlip}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 py-3 text-sm font-black text-black transition shadow-lg"
            >
              {submittingSlip ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  ยืนยันการชำระเงิน
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
