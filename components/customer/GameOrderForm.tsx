'use client';

import { PromptPayQRCard } from './PromptPayQRCard';
import { useState, useEffect } from 'react';
import type { GameWithDetails } from '@/lib/games/queries';
import {
  Check,
  AlertCircle,
  Loader2,
  X,
  UploadCloud,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Copy,
  AlertTriangle,
  QrCode,
  PackageCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GameOrderForm({
  game,
  userRole,
  isLoggedIn,
}: {
  game: GameWithDetails;
  userRole?: string;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Multi-package selection: Map of productId -> quantity
  const [selectedItems, setSelectedItems] = useState<{ [productId: string]: number }>({});

  const [playerData, setPlayerData] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'truemoney'>('promptpay');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [storeTerms, setStoreTerms] = useState<string>("");
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);
  const [copiedOrder, setCopiedOrder] = useState(false);

  // Dynamic store bank settings
  const [store, setStore] = useState({
    promptpay_id: '0988251064',
    account_name: 'ศักดาวิชญ์ คำใจ',
    bank_name: 'พร้อมเพย์',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.settings) {
          if (j.settings.terms_of_service) {
            setStoreTerms(j.settings.terms_of_service);
          }
          setStore({
            promptpay_id: j.settings.promptpay_id || '0988251064',
            account_name: j.settings.account_name || 'ศักดาวิชญ์ คำใจ',
            bank_name: j.settings.bank_name || 'พร้อมเพย์',
          });
        }
      })
      .catch(() => {});
  }, []);

  // Slip upload state for Step 3 modal
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [submittingSlip, setSubmittingSlip] = useState(false);
  const [slipMsg, setSlipMsg] = useState<string | null>(null);

  // Normalize products and fields
  const products = game.products || (game as any).packages || [];
  const rawFields = game.game_fields || (game as any).fields || [];
  const fields =
    rawFields.length > 0
      ? rawFields
      : [
          {
            id: 'default-uid',
            name: 'uid',
            label: 'UID / Player ID',
            type: 'text',
            placeholder: 'กรอก UID ผู้เล่น',
            required: true,
          },
        ];

  const isReseller =
    userRole === 'reseller' || userRole === 'admin' || userRole === 'super_admin';

  const getProductPrice = (p: any) => {
    if (isReseller && p.reseller_price != null && Number(p.reseller_price) > 0) {
      return Number(p.reseller_price);
    }
    return Number(p.price || 0);
  };

  // Extract currency unit name from game or products (e.g. เพชร, Diamonds, UC, Coins)
  const getCurrencyUnit = () => {
    const sample = products[0]?.name || '';
    if (/เพชร|diamond/i.test(sample) || /free fire|rov|mobile legends/i.test(game.name)) {
      return 'เพชร';
    }
    if (/uc/i.test(sample) || /pubg/i.test(game.name)) {
      return 'UC';
    }
    if (/point|แต้ม/i.test(sample) || /valorant/i.test(game.name)) {
      return 'VP';
    }
    if (/coin|เหรียญ/i.test(sample)) {
      return 'เหรียญ';
    }
    return 'หน่วย';
  };

  const currencyUnit = getCurrencyUnit();

  // Multi-package quantity handlers
  const handleToggleSelect = (pId: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[pId]) {
        delete next[pId];
      } else {
        next[pId] = 1;
      }
      return next;
    });
  };

  const handleUpdateQty = (pId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[pId] || 0;
      const updated = current + delta;
      const next = { ...prev };
      if (updated <= 0) {
        delete next[pId];
      } else {
        next[pId] = updated;
      }
      return next;
    });
  };

  const handleRemoveItem = (pId: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      delete next[pId];
      return next;
    });
  };

  // Real-time calculations
  const selectedProductList = products
    .filter((p: any) => selectedItems[p.id] && selectedItems[p.id] > 0)
    .map((p: any) => {
      const qty = selectedItems[p.id];
      const unitPrice = getProductPrice(p);
      // parse numeric amount from product name or amount field if present
      let numericAmount = 0;
      if (p.amount != null && !isNaN(Number(p.amount))) {
        numericAmount = Number(p.amount);
      } else {
        const match = p.name.match(/[\d,]+/);
        if (match) {
          numericAmount = parseInt(match[0].replace(/,/g, ''), 10) || 0;
        }
      }
      return {
        product: p,
        qty,
        unitPrice,
        subtotal: unitPrice * qty,
        totalCurrency: numericAmount * qty,
      };
    });

  const totalItemTypesCount = selectedProductList.length;
  const totalPackagesCount = selectedProductList.reduce((acc, i) => acc + i.qty, 0);
  const baseSubtotal = selectedProductList.reduce((acc, i) => acc + i.subtotal, 0);
  const totalCurrencySum = selectedProductList.reduce((acc, i) => acc + i.totalCurrency, 0);
  const totalPayable = Math.max(0, baseSubtotal - couponDiscount);

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
          (c: any) =>
            c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.is_active
        );
        if (found) {
          let disc = 0;
          if (found.discount_type === 'percent') {
            disc = (baseSubtotal * Number(found.discount_value)) / 100;
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

  const handleProceedToStep2 = () => {
    // Validate player data
    for (const f of fields) {
      if (f.required && !playerData[f.name]?.trim()) {
        setError(`กรุณากรอก ${f.label}`);
        return;
      }
    }
    if (totalPackagesCount === 0) {
      setError('กรุณาเลือกแพ็กเกจอย่างน้อย 1 รายการ');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleConfirmOrder = async () => {
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setLoading(true);
    setError(null);

    const itemsPayload = selectedProductList.map((item) => ({
      product_id: item.product.id,
      quantity: item.qty,
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          product_id: itemsPayload[0]?.product_id,
          items: itemsPayload,
          player_data: playerData,
          payment_method: paymentMethod,
          coupon_code: couponDiscount > 0 ? couponCode : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'สร้างคำสั่งซื้อไม่สำเร็จ');
        setLoading(false);
        return;
      }

      setOrderNumber(data.order.order_number);
      setFinalAmount(data.order.total);
      setStep(3);
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setLoading(false);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      const reader = new FileReader();
      reader.onload = () => setSlipPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSlip = async () => {
    if (!slipPreview) return;
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
        router.push(`/order-tracking?number=${orderNumber}`);
      } else {
        setSlipMsg(data.message || 'ส่งสลิปไม่สำเร็จ');
      }
    } catch {
      setSlipMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setSubmittingSlip(false);
  };

  const copyOrder = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
            }`}
          >
            1
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-800">เลือกแพ็กเกจ</span>
        </div>
        <div className="h-0.5 w-12 sm:w-20 bg-sky-100" />
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
            }`}
          >
            2
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-800">ยืนยันข้อมูล</span>
        </div>
        <div className="h-0.5 w-12 sm:w-20 bg-sky-100" />
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 3 ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
            }`}
          >
            3
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-800">ชำระเงิน</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Form & Multi-package selection */}
      {step === 1 && (
        <div className="space-y-6">
          {/* 1. Account info */}
          <div className="bg-white rounded-2xl border border-sky-100 p-4 sm:p-6 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">
                1
              </span>
              กรอกข้อมูลผู้เล่น / ข้อมูลไอดี
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {fields.map((f: any) => (
                <div key={f.id || f.name}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {f.label || f.name} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={f.type || 'text'}
                    placeholder={f.placeholder || `กรอก ${f.label || f.name}`}
                    value={playerData[f.name] || ''}
                    onChange={(e) =>
                      setPlayerData((prev) => ({ ...prev, [f.name]: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sky-100 bg-sky-50/20 text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-400/20 focus:border-sky-500 transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Packages list with Multi-select and Quantity control (+, -, qty) */}
          <div className="bg-white rounded-2xl border border-sky-100 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">
                  2
                </span>
                เลือกแพ็กเกจ (สามารถเลือกได้หลายแพ็ก)
              </h3>
              {totalPackagesCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  เลือกแล้ว {totalPackagesCount} แพ็ก
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((p: any) => {
                const qty = selectedItems[p.id] || 0;
                const isSelected = qty > 0;
                const price = getProductPrice(p);

                return (
                  <div
                    key={p.id}
                    className={`relative p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/40 shadow-xs ring-1 ring-sky-400/40'
                        : 'border-slate-200/80 hover:border-sky-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">
                          {p.name}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-sky-600">
                          ฿{price.toLocaleString()}
                        </span>
                        {isReseller && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                            ราคาตัวแทน
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector on each card */}
                    <div className="mt-3 pt-2.5 border-t border-sky-100/60 flex items-center justify-between">
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 w-full justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">จำนวน:</span>
                          <div className="inline-flex items-center border border-sky-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(p.id, -1)}
                              className="px-2 py-1 hover:bg-sky-50 text-slate-600 transition"
                              title="ลดจำนวน"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={qty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1) {
                                  setSelectedItems((prev) => ({ ...prev, [p.id]: val }));
                                }
                              }}
                              className="w-9 text-center text-xs font-bold text-slate-800 focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(p.id, 1)}
                              className="px-2 py-1 hover:bg-sky-50 text-slate-600 transition"
                              title="เพิ่มจำนวน"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(p.id)}
                          className="w-full py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>เลือกแพ็กนี้</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Real-time Order Summary Card */}
          {totalPackagesCount > 0 && (
            <div className="bg-gradient-to-br from-white to-sky-50/50 rounded-2xl border-2 border-sky-200/80 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-sky-500" />
                  สรุปออเดอร์ ({totalItemTypesCount} รายการ, {totalPackagesCount} แพ็ก)
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedItems({})}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  ล้างรายการทั้งหมด
                </button>
              </div>

              {/* Items breakdown list */}
              <div className="divide-y divide-sky-100/60 my-3">
                {selectedProductList.map(({ product, qty, unitPrice, subtotal }) => (
                  <div
                    key={product.id}
                    className="py-2.5 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div className="flex-1 pr-3">
                      <div className="font-semibold text-slate-800">{product.name}</div>
                      <div className="text-[11px] text-slate-500">
                        ฿{unitPrice.toLocaleString()} × {qty} แพ็ก
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">฿{subtotal.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(product.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md transition"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estimated Currency to receive */}
              {totalCurrencySum > 0 && (
                <div className="p-3 rounded-xl bg-sky-100/60 border border-sky-200/80 flex items-center justify-between text-xs sm:text-sm mb-3">
                  <span className="font-semibold text-sky-900">ของที่จะได้รับทั้งหมด:</span>
                  <span className="font-extrabold text-sky-700 text-sm sm:text-base">
                    {totalCurrencySum.toLocaleString()} {currencyUnit}
                  </span>
                </div>
              )}

              {/* Price summary */}
              <div className="pt-2 border-t border-sky-100 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>ราคารวม:</span>
                  <span>฿{baseSubtotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>ส่วนลด:</span>
                    <span>-฿{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-sky-200/70 text-slate-800">
                  <span className="font-bold text-sm sm:text-base">ยอดชำระทั้งหมด:</span>
                  <span className="text-xl sm:text-2xl font-black text-sky-600">
                    ฿{totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleProceedToStep2}
              disabled={totalPackagesCount === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm sm:text-base transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>ต่อไป: ยืนยันข้อมูล</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Review & Coupon & Accept terms */}
      {step === 2 && (
        <div className="space-y-6 bg-white rounded-2xl border border-sky-100 p-4 sm:p-6 shadow-xs">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            ตรวจสอบข้อมูลคำสั่งซื้อ
          </h3>

          {/* Player data summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm space-y-1.5">
            <div className="font-bold text-slate-700 mb-1">ข้อมูลผู้เล่น:</div>
            {Object.entries(playerData).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-500">{k}:</span>
                <span className="font-semibold text-slate-800">{v}</span>
              </div>
            ))}
          </div>

          {/* Packages breakdown */}
          <div className="border border-sky-100 rounded-xl overflow-hidden">
            <div className="bg-sky-50/70 px-4 py-2.5 text-xs font-bold text-sky-900 border-b border-sky-100">
              รายการแพ็กเกจ ({totalPackagesCount} แพ็ก)
            </div>
            <div className="divide-y divide-sky-100/60 p-3">
              {selectedProductList.map(({ product, qty, unitPrice, subtotal }) => (
                <div
                  key={product.id}
                  className="py-2 flex justify-between text-xs sm:text-sm"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{product.name}</span>
                    <span className="text-slate-500 text-xs ml-2">
                      (฿{unitPrice.toLocaleString()} × {qty})
                    </span>
                  </div>
                  <span className="font-bold text-slate-800">฿{subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Code Input */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              โค้ดส่วนลด (ถ้ามี)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="กรอกโค้ดส่วนลด"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-sky-100 bg-sky-50/20 text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 uppercase"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={checkingCoupon || !couponCode.trim()}
                className="px-4 py-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-bold transition disabled:opacity-50"
              >
                {checkingCoupon ? 'ตรวจ...' : 'ใช้โค้ด'}
              </button>
            </div>
            {couponMsg && (
              <p
                className={`text-xs mt-1.5 ${
                  couponDiscount > 0 ? 'text-emerald-600 font-semibold' : 'text-red-500'
                }`}
              >
                {couponMsg}
              </p>
            )}
          </div>

          {/* Total summary */}
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">ยอดชำระสุทธิ:</span>
              <div className="text-xl sm:text-2xl font-black text-sky-600">
                ฿{totalPayable.toLocaleString()}
              </div>
            </div>
            {totalCurrencySum > 0 && (
              <div className="text-right">
                <span className="text-xs text-slate-500">จะได้รับรวม:</span>
                <div className="text-sm sm:text-base font-bold text-sky-800">
                  {totalCurrencySum.toLocaleString()} {currencyUnit}
                </div>
              </div>
            )}
          </div>

          {/* Terms checkbox */}
          <div>
            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className="mt-0.5 w-4 h-4 rounded text-sky-600 border-sky-300 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-700 font-medium select-none flex-1">
                  ฉันได้ตรวจสอบข้อมูลไอดีถูกต้อง และยอมรับ{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTermsModalOpen(true);
                    }}
                    className="text-sky-600 font-bold underline hover:text-sky-800 transition inline-flex items-center gap-0.5"
                  >
                    ข้อตกลงการใช้บริการ
                  </button>
                </span>
              </label>
              {termsError && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 pl-6">
                  <AlertCircle className="w-3.5 h-3.5" /> กรุณากดยอมรับข้อตกลงก่อนดำเนินการต่อ
                </p>
              )}
            </div>
            {termsError && (
              <p className="text-xs text-red-500 mt-1">
                กรุณายอมรับเงื่อนไขก่อนดำเนินการต่อ
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างออเดอร์...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>ชำระเงินด้วย PromptPay QR &rarr;</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: QR Payment Modal with Full Backdrop Blur, 2-Column Responsive Layout, and Click Blocking */}
      {step === 3 && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Container: 2 columns on wide screen, vertical on mobile */}
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl border border-sky-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  สแกนชำระเงินผ่าน PromptPay
                </h3>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/order-tracking?number=${orderNumber}`)}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                title="ปิดหน้านี้และไปติดตามออเดอร์"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Columns on desktop / iPad landscape */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-8 overflow-y-auto">
              {/* Left Column (md:col-span-6 or 7): Payment Details */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Order Number & Copy */}
                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium">หมายเลขออเดอร์:</span>
                      <div className="text-sm sm:text-base font-mono font-black text-sky-800">
                        {orderNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={copyOrder}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 text-xs font-semibold transition shadow-2xs"
                    >
                      {copiedOrder ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-sky-500" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Payment Details Table */}
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden text-xs sm:text-sm">
                    <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 border-b border-slate-200/80">
                      รายละเอียดการชำระเงิน
                    </div>
                    <div className="divide-y divide-slate-100 p-3.5 space-y-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">ยอดชำระทั้งหมด:</span>
                        <span className="text-lg sm:text-xl font-black text-emerald-600">
                          ฿{finalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">ช่องทางการชำระ:</span>
                        <span className="font-semibold text-slate-800">
                          {store.bank_name || 'พร้อมเพย์ (PromptPay)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">ชื่อบัญชี:</span>
                        <span className="font-bold text-sky-900">
                          {store.account_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">จำนวนแพ็กเกจ:</span>
                        <span className="font-semibold text-slate-800">
                          {totalPackagesCount} แพ็ก
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Crucial Account Warning */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">คำเตือนสำคัญ: </span>
                      <span>
                        กรุณาตรวจสอบชื่อบัญชีให้ถูกต้องก่อนโอนเงินทุกครั้ง ยอดเงินต้องตรงกับเศษสตางค์ (ถ้ามี)
                      </span>
                    </div>
                  </div>

                  {/* Slip Upload Input */}
                  <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
                    <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-sky-500" />
                      แนบสลิปเพื่อยืนยันการโอนเงิน
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlipChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-500 file:text-white hover:file:bg-sky-600 transition"
                    />
                    {slipPreview && (
                      <div className="mt-3 relative w-24 h-24 rounded-lg overflow-hidden border border-sky-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slipPreview}
                          alt="Slip preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {slipMsg && (
                      <p className="text-xs text-red-500 font-semibold mt-2">{slipMsg}</p>
                    )}
                  </div>
                </div>

                {/* Confirm upload button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleUploadSlip}
                    disabled={submittingSlip || !slipFile}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {submittingSlip ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังอัปโหลดสลิป...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ยืนยันการโอนเงิน &rarr;</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column (md:col-span-5): Clean QR Code without center logo */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50/60 p-4 sm:p-6 rounded-2xl border border-slate-100">
                <PromptPayQRCard
                  amount={finalAmount}
                  orderNumber={orderNumber}
                  promptpayId={store.promptpay_id}
                  accountName={store.account_name}
                  bankName={store.bank_name}
                  showDetails={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
