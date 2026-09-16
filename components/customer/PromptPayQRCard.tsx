'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, Loader2 } from 'lucide-react';
import { generatePromptPayPayload } from '@/lib/payments/promptpay';

interface PromptPayQRCardProps {
  amount: number;
  orderNumber?: string;
  promptpayId?: string;
  accountName?: string;
  bankName?: string;
}

export function PromptPayQRCard({
  amount,
  orderNumber,
  promptpayId = '0988251064',
  accountName = 'ศักดาวิชญ์ คำใจ',
  bankName = 'พร้อมเพย์',
}: PromptPayQRCardProps) {
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetAccount = (promptpayId || '0988251064').trim();
  const targetName = accountName || 'ศักดาวิชญ์ คำใจ';
  const targetBank = bankName || 'พร้อมเพย์';

  useEffect(() => {
    let cancelled = false;
    const payload = generatePromptPayPayload(targetAccount, amount);
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    const qrSize = 340;

    QRCode.toCanvas(
      canvas,
      payload,
      {
        width: qrSize,
        margin: 2,
        errorCorrectionLevel: 'H', // High error correction (~30%) for central logo
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

          const logoSize = qrSize * 0.22;
          const x = (qrSize - logoSize) / 2;
          const y = (qrSize - logoSize) / 2;
          const radius = logoSize * 0.22;

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
  }, [amount, targetAccount]);

  async function copyPromptPay() {
    try {
      await navigator.clipboard.writeText(targetAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  function downloadQr() {
    if (!qrImageUrl) return;
    const a = document.createElement('a');
    a.href = qrImageUrl;
    a.download = `NayMos-QR-${orderNumber || 'pay'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-sky-50/50 border border-sky-100 mx-auto w-full max-w-[280px] shadow-xs">
      {qrImageUrl ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl}
            alt="PromptPay QR Code"
            className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl bg-white p-1 border border-sky-100 shadow-sm"
          />
        </div>
      ) : (
        <div className="w-48 h-48 sm:w-52 sm:h-52 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white rounded-xl border border-sky-100">
          <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
          <span className="text-xs">กำลังสร้าง QR Code...</span>
        </div>
      )}

      {/* Account Info */}
      <span className="text-[11px] font-bold text-sky-800 mt-2 text-center">
        {targetBank} · {targetName}
      </span>

      {/* PromptPay Number with Copy */}
      <button
        type="button"
        onClick={copyPromptPay}
        className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 text-[11px] font-mono font-bold transition shadow-2xs"
        title="กดเพื่อคัดลอกเบอร์พร้อมเพย์"
      >
        <span>พร้อมเพย์: {targetAccount}</span>
        {copied ? (
          <Check className="w-3 h-3 text-emerald-500" />
        ) : (
          <Copy className="w-3 h-3 text-sky-500" />
        )}
      </button>

      {/* Watermark security label */}
      <p className="text-[10px] text-sky-700/60 font-medium mt-1.5 text-center select-none leading-tight">
        QR นี้ใช้สำหรับการรับบริการ NayMosGameShop เท่านั้น!!
      </p>

      {/* Download button */}
      {qrImageUrl && (
        <button
          type="button"
          onClick={downloadQr}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 hover:underline font-medium"
        >
          <Download className="w-3 h-3" />
          บันทึกรูป QR Code
        </button>
      )}
    </div>
  );
}
