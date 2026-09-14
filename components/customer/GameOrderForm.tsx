'use client';

import { useState } from 'react';
import type { GameWithDetails } from '@/lib/games/queries';
import { Check, AlertCircle, Loader2, X, UploadCloud, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GameOrderForm({ game, userRole, isLoggedIn }: { game: GameWithDetails; userRole?: string; isLoggedIn?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'truemoney'>('promptpay');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);

  // Slip upload state for Step 3 modal
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [submittingSlip, setSubmittingSlip] = useState(false);
  const [slipMsg, setSlipMsg] = useState<string | null>(null);

  // Normalize products and fields
  const products = game.products || (game as any).packages || [];
  const rawFields = game.game_fields || (game as any).fields || [];
  const fields = rawFields.length > 0 ? rawFields : [
    { id: 'default-uid', name: 'uid', label: 'UID / Player ID', type: 'text', placeholder: 'กรอก UID ผู้เล่น', required: true }
  ];

  const isReseller = userRole === 'reseller' || userRole === 'admin' || userRole === 'super_admin';
  const selectedProduct = products.find((p: any) => p.id === selectedPkg);
  const getProductPrice = (p: any) => {
    if (isReseller && p.reseller_price != null && Number(p.reseller_price) > 0) {
      return Number(p.reseller_price);
    }
    return Number(p.price || 0);
  };
  const basePrice = selectedProduct ? getProductPrice(selectedProduct) : 0;
  const totalPayable = Math.max(0, basePrice - couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        const coupons = data.coupons || data;
        const found = coupons.find(
          (c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.is_active
        );
        if (found) {
          let disc = 0;
          if (found.discount_type === 'percent') {
            disc = (basePrice * Number(found.discount_value)) / 100;
          } else {
            disc = Number(found.discount_value);
          }
          setCouponDiscount(disc);
          setCouponMsg(`ใช้โค้ดสำเร็จ ลด ฿${disc.toLocaleString()}`);
        } else {
          setCouponDiscount(0);
          setCouponMsg('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ');
        }
      } else {
        setCouponDiscount(0);
        setCouponMsg('ไม่สามารถตรวจสอบโค้ดได้');
      }
    } catch {
      setCouponDiscount(0);
      setCouponMsg('เกิดข้อผิดพลาดในการตรวจสอบโค้ด');
    }
    setCheckingCoupon(false);
  };

  const handleNextToStep2 = () => {
    setError(null);
    if (!isLoggedIn) {
      setError('กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนดำเนินการต่อ');
      router.push(`/login?next=/games/${game.slug || ''}`);
      return;
    }

    if (!selectedPkg) {
      setError('กรุณาเลือกแพ็กเกจ');
      return;
    }
    for (const f of fields) {
      const key = f.name || (f as any).field_key;
      if (f.required && !playerData[key]?.trim()) {
        setError(`กรุณากรอก ${f.label}`);
        return;
      }
    }
    setStep(2);
  };

  const handleSubmitOrder = async () => {
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          product_id: selectedPkg,
          player_data: playerData,
          coupon_code: couponDiscount > 0 ? couponCode : undefined,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'สร้างคำสั่งซื้อไม่สำเร็จ');
        setLoading(false);
        return;
      }

      setOrderNumber(data.order_number || data.orderNumber || '');
      setFinalAmount(totalPayable);
      setStep(3);
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      const reader = new FileReader();
      reader.onload = () => setSlipPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitSlip = async () => {
    if (!orderNumber || !slipFile) return;
    setSubmittingSlip(true);
    setSlipMsg(null);
    try {
      const res = await fetch('/api/orders/pay-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          slip_image: slipPreview,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/order-tracking');
      } else {
        setSlipMsg(data.message || 'ส่งสลิปไม่สำเร็จ');
      }
    } catch {
      setSlipMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setSubmittingSlip(false);
  };

  return (
    <div>
      {/* Step 1: Selection */}
      {step === 1 && (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-700 border border-sky-300">1</span>
              เลือกแพ็กเกจ
            </h3>
            {products.length === 0 ? (
              <p className="text-xs text-slate-400">ยังไม่มีแพ็กเกจในเกมนี้ (เพิ่มได้ในหน้าจัดการสินค้าหลังบ้าน)</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map((p: any) => {
                  const isSelected = selectedPkg === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPkg(p.id)}
                      className={`relative rounded-xl border p-3.5 text-left transition ${
                        isSelected
                          ? 'border-2 border-sky-500 bg-sky-50 text-slate-900 shadow-xs'
                          : 'border-sky-100 bg-white/50 text-slate-600 hover:border-sky-200'
                      }`}
                    >
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="mt-1">
                        {isReseller && p.reseller_price != null && Number(p.reseller_price) > 0 ? (
                          <div className="flex flex-col">
                            <span className="inline-block text-[10px] text-emerald-400 font-medium">ราคาส่งตัวแทน</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-emerald-400 font-bold">฿{Number(p.reseller_price).toLocaleString()}</span>
                              <span className="text-[11px] text-slate-400 line-through">฿{Number(p.price).toLocaleString()}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-sky-600 font-bold">฿{Number(p.price).toLocaleString()}</div>
                        )}
                      </div>
                      {isSelected && (
                        <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 text-sky-700 border border-sky-300">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-700 border border-sky-300">2</span>
              ข้อมูลผู้เล่น
            </h3>
            <div className="space-y-3">
              {fields.map((f: any) => {
                const key = f.name || f.field_key || 'uid';
                return (
                  <div key={f.id || key}>
                    <label className="block text-xs text-slate-500 mb-1">
                      {f.label} {f.required && <span className="text-sky-600">*</span>}
                    </label>
                    <input
                      type={key.includes('pass') ? 'password' : 'text'}
                      value={playerData[key] || ''}
                      onChange={(e) => setPlayerData({ ...playerData, [key]: e.target.value })}
                      placeholder={f.placeholder || `กรอก ${f.label}`}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full rounded-xl border-2 border-sky-200 bg-white px-3.5 py-2.5 text-sm font-semibold !text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200/50 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-700 border border-sky-300">3</span>
              เลือกช่องทางชำระเงิน
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('promptpay')}
                className={`rounded-xl border p-3.5 text-center transition ${
                  paymentMethod === 'promptpay' ? 'border-2 border-sky-500 bg-sky-100/70 text-sky-900 shadow-sm ring-2 ring-sky-300' : 'border-sky-100 bg-white text-slate-600 hover:border-sky-200'
                }`}
              >
                <div className="font-bold text-sm text-sky-800">พร้อมเพย์ QR</div>
                <div className="text-xs text-sky-600 font-bold mt-0.5">PromptPay</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('truemoney')}
                className={`rounded-xl border p-3.5 text-center transition ${
                  paymentMethod === 'truemoney' ? 'border-2 border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-300' : 'border-sky-100 bg-white text-slate-600 hover:border-sky-200'
                }`}
              >
                <div className="font-bold text-sm text-amber-800">ทรูมันนี่ QR</div>
                <div className="text-xs text-amber-600 font-bold mt-0.5">TrueMoney QR</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-sky-500/15 border border-sky-500/30 p-3 text-xs text-sky-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleNextToStep2}
            className="w-full rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-700 py-3 text-sm font-bold text-white transition shadow-lg"
          >
            ไปที่หน้ารายละเอียดคำสั่งซื้อ
          </button>
        </div>
      )}

      {/* Step 2: Details & Terms */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">เงื่อนไขการให้บริการ</h4>
              <div className="h-56 overflow-y-auto rounded-xl border border-sky-100 bg-white/60 p-4 text-xs text-slate-500 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-600">1. การสั่งซื้อและการเติมเกม</p>
                <p>กรุณาตรวจสอบความถูกต้องของ UID หรือ บัญชีผู้ใช้ ก่อนทำการสั่งซื้อ ทางร้านจะไม่รับผิดชอบหากกรอกข้อมูลผิดพลาด</p>
                <p className="font-semibold text-slate-600">2. ระยะเวลาดำเนินการ</p>
                <p>การเติมเงินจะดำเนินการภายใน 5-15 นาทีหลังยืนยันการชำระเงินและแนบสลิปเรียบร้อย</p>
                <p className="font-semibold text-slate-600">3. นโยบายการคืนเงิน</p>
                <p>หากการเติมเงินสำเร็จแล้ว จะไม่สามารถขอคืนเงินหรือยกเลิกคำสั่งซื้อได้ในทุกกรณี</p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-sky-200 bg-white text-red-600 focus:ring-red-500"
                />
                <span className="text-xs text-slate-600 select-none">
                  ฉันยอมรับเงื่อนไขการให้บริการ <span className="text-sky-600">*</span>
                </span>
              </label>

              {termsError && (
                <p className="text-xs text-sky-600 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  กรุณากดยอมรับเงื่อนไขการให้บริการก่อนกดยืนยัน
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">สรุปรายการคำสั่งซื้อ</h4>
              <div className="rounded-xl border border-sky-100 bg-white/70 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-sky-100/80">
                  <span className="text-slate-500">เกม:</span>
                  <span className="font-bold text-slate-800">{game.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sky-100/80">
                  <span className="text-slate-500">แพ็กเกจ:</span>
                  <span className="font-bold text-slate-800">{selectedProduct?.name}</span>
                </div>
                {fields.map((f: any) => {
                  const key = f.name || f.field_key || 'uid';
                  return (
                    <div key={f.id || key} className="flex justify-between py-1 border-b border-sky-100/80">
                      <span className="text-slate-500">{f.label}:</span>
                      <span className="font-mono text-slate-700">
                        {key.includes('pass') ? '••••••••' : playerData[key]}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between py-1 border-b border-sky-100/80">
                  <span className="text-slate-500">ช่องทางชำระเงิน:</span>
                  <span className="text-slate-800 capitalize font-bold">{paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'ทรูมันนี่ QR'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">ราคาปกติ:</span>
                  <span className="text-slate-800 font-bold">฿{Number(basePrice).toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-400">
                    <span>ส่วนลด:</span>
                    <span>-฿{Number(couponDiscount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-sky-100 text-sm font-bold">
                  <span className="text-slate-800 font-bold">ยอดชำระสุทธิ:</span>
                  <span className="text-sky-600 font-black">฿{Number(totalPayable).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">โค้ดส่วนลด</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="กรอกโค้ดส่วนลด"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="flex-1 rounded-xl border-2 border-sky-200 bg-white px-3 py-2 text-xs font-semibold !text-slate-900 placeholder:text-slate-400 uppercase focus:border-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={checkingCoupon || !couponCode.trim()}
                    className="rounded-xl bg-slate-100 hover:bg-zinc-700 disabled:opacity-50 px-3.5 py-2 text-xs font-semibold text-slate-700"
                  >
                    {checkingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'ใช้โค้ด'}
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-[11px] mt-1.5 ${couponDiscount > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {couponMsg}
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-sky-500/15 border border-sky-500/30 p-3 text-xs text-sky-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-sky-200 hover:bg-slate-100 px-5 py-3 text-xs font-semibold text-slate-600 transition"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmitOrder}
              className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-700 disabled:opacity-50 py-3 text-sm font-bold text-white transition shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ยืนยันการชำระเงิน'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Exact UI from Image 2 */}
      {step === 3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-sky-100 bg-sky-50/60 p-6 shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => router.push('/order-tracking')}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full bg-white border border-sky-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">สแกนชำระเงิน</span>
              <h3 className="text-xl font-black text-sky-900">พร้อมเพย์ / QR Payment</h3>
              <p className="text-xs text-slate-500 font-mono">ออเดอร์: {orderNumber}</p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white mx-auto w-fit shadow-inner">
              <img
                src={`https://promptpay.io/0812345678/${finalAmount || totalPayable}.png`}
                alt="QR Code"
                className="w-48 h-48 object-contain"
              />
              <span className="text-xs font-bold text-sky-700 mt-1">PromptPay QR</span>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500">ยอดชำระสุทธิ</p>
              <p className="text-2xl font-black text-sky-600">฿{Number(finalAmount || totalPayable).toLocaleString()} บาท</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">
                แนบรูปภาพสลิปการโอนเงิน (จำเป็น)
              </label>
              <div className="relative border-2 border-dashed border-sky-200 hover:border-amber-500/80 rounded-2xl p-4 text-center cursor-pointer transition bg-white/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {slipPreview ? (
                  <div className="flex items-center justify-center gap-3">
                    <img src={slipPreview} alt="Slip Preview" className="w-12 h-12 object-cover rounded-lg border border-sky-200" />
                    <div className="text-left">
                      <p className="text-xs font-medium text-emerald-400">เลือกรูปสลิปแล้ว</p>
                      <p className="text-[10px] text-slate-400">คลิกเพื่อเปลี่ยนรูป</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-500">
                    <UploadCloud className="w-6 h-6 text-amber-400" />
                    <span className="text-xs font-medium">กดเพื่อเลือกรูปภาพสลิปจากเครื่อง</span>
                    <span className="text-[10px] text-slate-400">รองรับไฟล์ JPG, PNG</span>
                  </div>
                )}
              </div>
            </div>

            {slipMsg && <p className="text-center text-xs text-sky-600">{slipMsg}</p>}

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
