'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Loader2, Copy, Check, CreditCard, Download, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { orderStatusLabel } from '@/lib/orders/status';
import { generatePromptPayPayload } from '@/lib/payments/promptpay';

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
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletMsg, setWalletMsg] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoggedIn, setWalletLoggedIn] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  const [store, setStore] = useState({
    promptpay_id: '0988251064',
    account_name: 'ศักดาวิชญ์ คำใจ',
    bank_name: 'พร้อมเพย์',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    void load();
    void fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.settings) {
          setStore({
            promptpay_id: j.settings.promptpay_id || '0988251064',
            account_name: j.settings.account_name || 'ศักดาวิชญ์ คำใจ',
            bank_name: j.settings.bank_name || 'พร้อมเพย์',
          });
        }
      })
      .catch(() => {});

    void fetch('/api/wallet/balance')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setWalletLoggedIn(Boolean(j.loggedIn));
          setWalletBalance(j.loggedIn ? Number(j.balance ?? 0) : null);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  // Generate QR Code with Error Correction Level H and draw logo in center
  useEffect(() => {
    if (!data) return;

    let cancelled = false;
    const promptpayTarget = store.promptpay_id || '0988251064';
    
    // Determine payload string
    let payload = data.qr_data;
    if (!payload || !payload.startsWith('000201')) {
      payload = generatePromptPayPayload(promptpayTarget, data.amount);
    }

    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    const qrSize = 340;

    QRCode.toCanvas(
      canvas,
      payload,
      {
        width: qrSize,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0369a1', // Sky-700
          light: '#ffffff',
        },
      },
      (err) => {
        if (err || cancelled) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Overlay central NayMos GameShop logo
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.src = '/images/logo.png';
        logo.onload = () => {
          if (cancelled) return;

          const logoSize = qrSize * 0.22; // ~22% size allows 100% scan with 'H' level (up to 30%)
          const x = (qrSize - logoSize) / 2;
          const y = (qrSize - logoSize) / 2;
          const radius = logoSize * 0.2;

          // Draw white rounded background with subtle border for contrast
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x - 4, y - 4, logoSize + 8, logoSize + 8, radius + 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#bae6fd'; // sky-200
          ctx.stroke();

          // Clip logo to rounded rect
          ctx.beginPath();
          ctx.roundRect(x, y, logoSize, logoSize, radius);
          ctx.clip();
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          ctx.restore();

          setQrImageUrl(canvas.toDataURL('image/png'));
        };

        logo.onerror = () => {
          if (!cancelled) {
            setQrImageUrl(canvas.toDataURL('image/png'));
          }
        };
      }
    );

    return () => {
      cancelled = true;
    };
  }, [data, store.promptpay_id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pay?number=${encodeURIComponent(orderNumber)}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? 'ดึงข้อมูลการชำระเงินไม่สำเร็จ');
      } else {
        setData(json);
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
    setLoading(false);
  }

  async function copyText(text: string, isOrder = false) {
    try {
      await navigator.clipboard.writeText(text);
      if (isOrder) {
        setCopiedOrder(true);
        setTimeout(() => setCopiedOrder(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  }

  function downloadQr() {
    if (!qrImageUrl || !data) return;
    const a = document.createElement('a');
    a.href = qrImageUrl;
    a.download = `NayMos-QR-${data.order_number}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        กำลังโหลดข้อมูลการชำระเงิน...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-medium text-rose-700">
        {error ?? 'ไม่พบข้อมูล'}
        <div className="mt-4">
          <Link href="/order-tracking" className="text-sky-600 hover:underline font-semibold">
            กลับไปหน้าติดตามออเดอร์
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
        <h2 className="text-xl font-bold text-emerald-300">ชำระเงินเรียบร้อยแล้ว</h2>
        <p className="text-sm text-slate-500">
          ออเดอร์ <span className="font-mono text-slate-800">{data.order_number}</span>
        </p>
        <p className="text-sm text-slate-400">
          สถานะ: {orderStatusLabel(data.order_status)} · รอระบบดำเนินการเติมเกม
        </p>
        <Link
          href={`/order-tracking?number=${encodeURIComponent(data.order_number)}`}
          className="inline-flex mt-2 rounded-xl bg-sky-100 text-sky-800 hover:bg-zinc-700 px-5 py-2.5 text-sm transition font-medium"
        >
          ดูสถานะออเดอร์
        </Link>
      </div>
    );
  }

  const promptpayId = store.promptpay_id || '0988251064';
  const accountName = store.account_name || 'ศักดาวิชญ์ คำใจ';
  const bankName = store.bank_name || 'พร้อมเพย์';

  return (
    <div className="space-y-6">
      {/* Order info card */}
      <div className="rounded-2xl border border-sky-100 bg-white p-6 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-sky-600 mb-2">
          <CreditCard className="h-5 w-5" />
          <h2 className="font-semibold text-slate-800">ชำระเงินค่าสินค้า</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-400 text-xs">เลขออเดอร์</p>
            <p className="font-mono font-bold text-slate-800">{data.order_number}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">ยอดชำระ</p>
            <p className="text-2xl font-bold text-sky-600">฿{Number(data.amount).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">เกม</p>
            <p className="text-slate-800 font-medium">{data.game_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">แพ็กเกจ</p>
            <p className="text-slate-800 font-medium">{data.product_name ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* QR Code Presentation Box */}
      <div className="rounded-2xl border border-sky-100 bg-white p-6 text-center space-y-4 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            PromptPay QR Code สแกนได้ทุกธนาคาร
          </span>
          <p className="text-xs text-slate-500 mt-2">
            เปิดแอปธนาคารของคุณ แล้วสแกน QR Code ด้านล่างเพื่อชำระเงิน
          </p>
        </div>

        {/* QR container */}
        <div className="relative mx-auto w-64 max-w-full rounded-2xl bg-gradient-to-b from-sky-50 to-white p-4 border border-sky-100 shadow-inner flex flex-col items-center justify-center">
          {qrImageUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt="PromptPay QR Code NayMos GameShop"
                className="w-56 h-56 rounded-xl shadow-sm border border-white"
              />
            </div>
          ) : (
            <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
              <span className="text-xs">กำลังสร้าง QR Code...</span>
            </div>
          )}

          {/* Amount tag */}
          <div className="mt-3 font-bold text-sky-700 text-lg">
            ฿{Number(data.amount).toLocaleString()}
          </div>

          {/* Subtle watermark / security label requested by user */}
          <p className="text-[10px] text-sky-700/60 font-medium mt-1 select-none text-center">
            QR นี้ใช้สำหรับการรับบริการ NayMosGameShop เท่านั้น!!
          </p>
        </div>

        {/* Download QR button */}
        {qrImageUrl && (
          <button
            type="button"
            onClick={downloadQr}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-medium hover:underline py-1"
          >
            <Download className="w-3.5 h-3.5" />
            บันทึกรูป QR Code ลงเครื่อง
          </button>
        )}

        {data.expires_at && (
          <p className="text-xs text-slate-400">
            หมดอายุเวลา: {new Date(data.expires_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
          </p>
        )}
      </div>

      {/* Account Details Box */}
      <div className="rounded-2xl border border-sky-100 bg-white p-6 space-y-3 text-sm shadow-sm">
        <h3 className="font-semibold text-slate-800">รายละเอียดบัญชีรับโอน</h3>
        
        <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-100">
          <span className="text-slate-400 text-xs">ธนาคาร/ช่องทาง</span>
          <span className="text-slate-800 font-medium">{bankName}</span>
        </div>

        <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-100">
          <span className="text-slate-400 text-xs">ชื่อบัญชี</span>
          <span className="text-slate-800 font-semibold">{accountName}</span>
        </div>

        {promptpayId ? (
          <div className="flex justify-between items-center gap-2 py-1 border-b border-slate-100">
            <span className="text-slate-400 text-xs">เบอร์พร้อมเพย์</span>
            <button
              type="button"
              onClick={() => copyText(promptpayId, false)}
              className="flex items-center gap-1.5 text-sky-700 font-mono text-xs font-bold hover:text-sky-800 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200"
              title="กดเพื่อคัดลอกเบอร์พร้อมเพย์"
            >
              {promptpayId}
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : null}

        <div className="flex justify-between items-center gap-2 py-1">
          <span className="text-slate-400 text-xs">เลขออเดอร์อ้างอิง</span>
          <button
            type="button"
            onClick={() => copyText(data.order_number, true)}
            className="flex items-center gap-1.5 text-slate-700 font-mono text-xs hover:text-sky-600"
            title="กดเพื่อคัดลอกเลขออเดอร์"
          >
            {data.order_number}
            {copiedOrder ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        <p className="text-xs text-amber-800/90 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
          ⚠️ โอนยอดเงินตรงตามที่ระบุ · ระบบจะตรวจสอบยอดเงินและดำเนินการเติมเกมให้อัตโนมัติหลังแจ้งชำระ
        </p>
      </div>

      {/* Wallet option */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-2.5">
        <p className="text-sm text-slate-700 font-medium">ชำระด้วย Wallet (สำหรับสมาชิกร้าน)</p>
        {walletLoggedIn ? (
          <p className="text-xs text-slate-500">
            ยอดคงเหลือ:{' '}
            <span className="text-emerald-600 font-semibold">
              ฿{(walletBalance ?? 0).toLocaleString()}
            </span>
          </p>
        ) : (
          <p className="text-xs text-slate-400">เข้าสู่ระบบเพื่อใช้ยอดคงเหลือเติมเกม</p>
        )}
        <button
          type="button"
          disabled={walletLoading}
          onClick={async () => {
            setWalletMsg(null);
            setWalletLoading(true);
            try {
              const res = await fetch('/api/pay/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_number: data.order_number }),
              });
              const json = await res.json();
              if (json.success) {
                setWalletMsg(json.message ?? 'ชำระเงินสำเร็จ');
                await load();
              } else {
                setWalletMsg(json.message ?? 'ชำระด้วย Wallet ไม่สำเร็จ');
                if (typeof json.balance === 'number') setWalletBalance(json.balance);
              }
            } catch {
              setWalletMsg('เกิดข้อผิดพลาดในการชำระเงิน');
            }
            setWalletLoading(false);
          }}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 py-2.5 text-sm font-semibold transition shadow-sm"
        >
          {walletLoading ? 'กำลังประมวลผล...' : 'ยืนยันจ่ายด้วย Wallet'}
        </button>
        {walletMsg && (
          <p className={`text-xs ${walletMsg.includes('สำเร็จ') ? 'text-emerald-600' : 'text-rose-600'}`}>
            {walletMsg}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => void load()}
          className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-600 text-white py-3 text-sm font-medium transition shadow-sm"
        >
          รีเฟรชสถานะการชำระ
        </button>
        <Link
          href={`/order-tracking?number=${encodeURIComponent(data.order_number)}`}
          className="flex-1 text-center rounded-xl border border-sky-200 bg-white hover:bg-sky-50 py-3 text-sm font-medium text-slate-700 transition shadow-sm"
        >
          ไปหน้าติดตามออเดอร์
        </Link>
      </div>
    </div>
  );
}
