'use client';

import { useState, useEffect } from 'react';
import type { GameWithDetails } from '@/lib/games/queries';
import { Check, AlertCircle, Loader2, Info, ArrowLeft, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function GameOrderForm({ game }: { game: GameWithDetails }) {
  const router = useRouter();

  // 1 = เลือกแพ็กเกจ & กรอกข้อมูล, 2 = ตรวจสอบเงื่อนไขและรายละเอียด, 3 = Popup QR Modal
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'truemoney'>('promptpay');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // ส่วนลด / คูปอง
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // สร้างคำสั่งซื้อ
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);

  // เวลานับถอยหลัง 10 นาที (600 วินาที)
  const [timeLeft, setTimeLeft] = useState(600);

  const pkg = game.products.find((p) => p.id === selectedPkg);
  const basePrice = pkg ? Number(pkg.price) : 0;
  const totalPayable = Math.max(0, basePrice - couponDiscount);

  useEffect(() => {
    if (step !== 3) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), amount: basePrice }),
      });
      const data = await res.json();
      if (data.valid && data.discount) {
        setCouponDiscount(Number(data.discount));
        setCouponMsg(`ใช้ส่วนลดสำเร็จ: -฿${data.discount}`);
      } else {
        setCouponDiscount(0);
        setCouponMsg(data.message ?? 'โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ');
      }
    } catch {
      setCouponMsg('ไม่สามารถตรวจสอบโค้ดส่วนลดได้');
    }
    setCheckingCoupon(false);
  }

  const canProceedToReview =
    !!selectedPkg &&
    game.game_fields.every((f) => !f.required || (playerData[f.name]?.trim() ?? '') !== '');

  async function handleConfirmOrder() {
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }
    if (!pkg) return;

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
          coupon_code: couponCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message ?? 'สร้างออเดอร์ไม่สำเร็จ');
        setLoading(false);
        return;
      }

      setOrderNumber(data.order.order_number);
      setFinalAmount(Number(data.order.total ?? totalPayable));
      setTimeLeft(600);
      setStep(3);
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    }
    setLoading(false);
  }

  const qrImageSrc = `https://promptpay.io/0812345678/${finalAmount || totalPayable}.png`;

  return (
    <div className="w-full">
      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold">1</span>
              เลือกแพ็กเกจที่ต้องการเติม
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {game.products.map((p) => {
                const isSelected = selectedPkg === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPkg(p.id)}
                    className={`rounded-xl border p-3 text-left transition-all relative ${
                      isSelected
                        ? 'border-red-500 bg-red-950/30 ring-1 ring-red-500'
                        : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                    }`}
                  >
                    <p className="font-semibold text-sm text-zinc-100">{p.name}</p>
                    <p className="text-xs text-red-400 font-bold mt-1">฿{Number(p.price).toLocaleString()}</p>
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold">2</span>
              กรอกข้อมูลสำหรับเติมเกม
            </h2>
            <div className="space-y-3">
              {game.game_fields.map((f) => (
                <div key={f.id} className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                    {f.label}
                    {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={f.name.toLowerCase().includes('pass') ? 'password' : 'text'}
                    placeholder={f.placeholder ?? f.label}
                    value={playerData[f.name] ?? ''}
                    onChange={(e) =>
                      setPlayerData((prev) => ({ ...prev, [f.name]: e.target.value }))
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold">3</span>
              เลือกช่องทางชำระเงิน
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('promptpay')}
                className={`rounded-xl border p-4 text-left flex items-center justify-between transition-all ${
                  paymentMethod === 'promptpay'
                    ? 'border-red-500 bg-red-950/20 ring-1 ring-red-500'
                    : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                }`}
              >
                <div>
                  <p className="font-semibold text-sm text-zinc-100">QR PromptPay</p>
                  <p className="text-xs text-zinc-400 mt-0.5">สแกนจ่ายได้ทุกธนาคาร ไม่มีค่าธรรมเนียม</p>
                </div>
                {paymentMethod === 'promptpay' && <Check className="h-5 w-5 text-red-500" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('truemoney')}
                className={`rounded-xl border p-4 text-left flex items-center justify-between transition-all ${
                  paymentMethod === 'truemoney'
                    ? 'border-red-500 bg-red-950/20 ring-1 ring-red-500'
                    : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                }`}
              >
                <div>
                  <p className="font-semibold text-sm text-zinc-100">TrueMoney PromptPay</p>
                  <p className="text-xs text-zinc-400 mt-0.5">TrueMoney Wallet สแกนจ่าย ไม่มีค่าธรรมเนียม</p>
                </div>
                {paymentMethod === 'truemoney' && <Check className="h-5 w-5 text-red-500" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={!canProceedToReview}
            onClick={() => setStep(2)}
            className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 text-sm font-bold text-white shadow-lg transition-all"
          >
            ไปที่หน้ารายละเอียดคำสั่งซื้อ
          </button>
        </div>
      )}

      {step === 2 && pkg && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 overflow-hidden flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <h2 className="text-center text-lg font-bold text-zinc-100 pb-2 border-b border-zinc-800">
                เงื่อนไขการให้บริการ
              </h2>
              <ul className="text-sm text-zinc-300 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span>
                    <strong className="text-white">กรุณาใส่เลข ID ให้ถูกต้อง</strong> ตัวอย่างการดูเลขอยู่ด้านข้างกดตรงเครื่องหมาย{' '}
                    <Info className="inline h-4 w-4 text-zinc-400" />{' '}
                    <span className="text-red-400 block mt-1 font-semibold">
                      หากลูกค้ากรอกเลข ID มาผิด ทางเราจะไม่รับผิดชอบและไม่มีการคืนเงินใด ๆ ทั้งสิ้น
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span>
                    หลังจากสั่งซื้อสำเร็จ จะขึ้นสถานะคำสั่งซื้อว่า <strong className="text-amber-400">รอดำเนินการ</strong> และ <strong className="text-emerald-400">สำเร็จ</strong> ตามลำดับ กรุณารอ 5 - 60 นาที ยอดเงินจะเข้าเกม
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span>
                    <strong className="text-white">ไม่มีการยกเลิกรายการ</strong> และไม่สามารถขอคืนเงินหรือเครดิตได้ หลังการทำรายการแล้ว
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span>
                    หากมีข้อสงสัยหรือเกิดปัญหา ให้แจ้งทางเจ้าหน้าที่ของเราผ่านช่องทางติดต่อบนหน้าเว็บไซต์ได้ทุกช่องทาง
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-zinc-950/60 border-t border-zinc-800">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className="w-5 h-5 rounded text-red-600 border-zinc-600 focus:ring-red-500 bg-zinc-900"
                />
                <span className="text-sm font-semibold text-zinc-200">
                  ฉันยอมรับเงื่อนไขการให้บริการ
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 space-y-4">
            <h2 className="text-lg font-bold text-zinc-100 pb-2 border-b border-zinc-800">
              รายละเอียดคำสั่งซื้อ
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">เกม</span>
                <span className="font-semibold text-white">{game.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">สินค้า</span>
                <span className="font-semibold text-white">{pkg.name}</span>
              </div>

              <div className="border-t border-zinc-800/80 pt-2 pb-1">
                <p className="text-xs text-zinc-400 mb-1">ข้อมูลสำหรับเติมเกม</p>
                {Object.entries(playerData).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-xs py-0.5">
                    <span className="text-zinc-400 capitalize">{key}:</span>
                    <span className="font-mono text-zinc-200 font-semibold">{val}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between py-1 border-t border-zinc-800/80">
                <span className="text-zinc-400">ช่องทางชำระเงิน</span>
                <div className="text-right">
                  <span className="font-semibold text-white block">
                    {paymentMethod === 'truemoney' ? 'Truemoney PromptPay' : 'QR PromptPay'}
                  </span>
                  <span className="text-xs text-zinc-400">ไม่มีค่าธรรมเนียม</span>
                </div>
              </div>

              <div className="border-t border-zinc-800/80 pt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="กรอกโค้ดส่วนลด"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-white uppercase outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    disabled={checkingCoupon || !couponCode.trim()}
                    onClick={applyCoupon}
                    className="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 text-white disabled:opacity-50"
                  >
                    {checkingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'ใช้โค้ด'}
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-xs mt-1.5 ${couponDiscount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              <div className="border-t border-zinc-800 pt-3 space-y-1.5">
                <div className="flex justify-between text-zinc-400 text-xs">
                  <span>รวมราคาสินค้า</span>
                  <span>฿ {basePrice.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 text-xs font-semibold">
                    <span>ส่วนลด</span>
                    <span>-฿ {couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-200 text-sm font-semibold">
                  <span>ยอดรวม</span>
                  <span>฿ {totalPayable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white text-base font-bold pt-1 border-t border-zinc-800/60">
                  <span>ยอดต้องชำระ</span>
                  <span className="text-red-400">฿ {totalPayable.toFixed(2)}</span>
                </div>
              </div>

              {termsError && !acceptedTerms && (
                <div className="rounded-xl bg-red-950/40 border border-red-800/60 p-2.5 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>ท่านต้องกดยอมรับเงื่อนไขการให้บริการก่อนยืนยันการสั่งซื้อ</span>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmOrder}
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 py-3 text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  ยืนยันการสั่งซื้อ
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950/50 hover:bg-zinc-800 py-2 text-xs font-semibold text-zinc-300"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSelectedPkg(null);
                      setPlayerData({});
                    }}
                    className="rounded-xl border border-zinc-700 bg-zinc-950/50 hover:bg-zinc-800 py-2 text-xs font-semibold text-zinc-400"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-center font-bold text-lg text-white">
              {paymentMethod === 'truemoney' ? 'Truemoney PromptPay' : 'QR PromptPay'}
            </h3>

            <div className="flex justify-between items-center text-xs px-1">
              <span className="font-mono text-zinc-400 font-semibold">{orderNumber}</span>
              <div className="flex items-center gap-1 rounded-full bg-zinc-800/80 px-2.5 py-1 text-amber-400 font-mono font-bold">
                <Clock className="h-3 w-3" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center px-1 text-sm">
              <span className="text-zinc-400">ยอดชำระเงิน</span>
              <span className="text-base font-bold text-white">{finalAmount.toFixed(2)} บาท</span>
            </div>

            <div className="relative rounded-2xl bg-white p-4 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              <img
                src={qrImageSrc}
                alt="QR Code สำหรับชำระเงิน"
                className="w-56 h-56 object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                <span className="text-center text-red-600 font-bold text-sm bg-white/80 px-2 py-1 rounded shadow">
                  ใช้สำหรับเติมเกม<br />โปรดระวังมิจฉาชีพแอบอ้าง
                </span>
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 pt-1 text-[10px] text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">ธนาคารทุกแห่ง</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">TrueMoney</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">PromptPay</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/account/orders')}
                className="w-full rounded-xl border border-pink-600/50 hover:bg-pink-950/20 py-2.5 text-sm font-semibold text-pink-300 transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
