'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { generatePromptPayPayload } from '@/lib/payments/promptpay';

interface PromptPayQRCardProps {
  amount: number;
  orderNumber?: string;
  promptpayId?: string;
  accountName?: string;
  bankName?: string;
  showDetails?: boolean;
}

export function PromptPayQRCard({
  amount,
  orderNumber,
  promptpayId = '0988251064',
  accountName = 'ศักดาวิชญ์ คำใจ',
  bankName = 'พร้อมเพย์',
  showDetails = true,
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
    const qrSize = 360;

    // Requirement: REMOVE CENTER LOGO COMPLETELY
    // Clean, high-contrast, maximum scanability on mobile screens
    QRCode.toCanvas(
      canvas,
      payload,
      {
        width: qrSize,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0369a1', // Sky-700
          light: '#ffffff',
        },
      },
      (err) => {
        if (err || cancelled) return;
        setQrImageUrl(canvas.toDataURL('image/png'));
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
    <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-sm w-full max-w-[320px] mx-auto">
      {qrImageUrl ? (
        <div className="relative group p-2 bg-white rounded-xl border border-sky-200/70 shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl}
            alt="PromptPay QR Code"
            className="w-56 h-56 sm:w-60 sm:h-60 object-contain rounded-lg bg-white"
          />
        </div>
      ) : (
        <div className="w-56 h-56 sm:w-60 sm:h-60 flex flex-col items-center justify-center text-slate-400 gap-2 bg-sky-50/50 rounded-xl border border-sky-100">
          <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
          <span className="text-xs font-medium">กำลังโหลด QR Code...</span>
        </div>
      )}

      {showDetails && (
        <div className="w-full mt-3 flex flex-col items-center text-center">
          <div className="text-xs text-slate-600 font-medium">
            <span>ชื่อบัญชี: </span>
            <span className="font-bold text-sky-900">{targetName}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            ธนาคาร: {targetBank}
          </div>

          <button
            type="button"
            onClick={copyPromptPay}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100/80 text-xs font-mono font-bold transition shadow-2xs"
            title="กดเพื่อคัดลอกเบอร์พร้อมเพย์"
          >
            <span>พร้อมเพย์: {targetAccount}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-sky-500" />
            )}
          </button>

          {qrImageUrl && (
            <button
              type="button"
              onClick={downloadQr}
              className="mt-2 inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 hover:underline font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              บันทึกรูป QR Code
            </button>
          )}

          <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-center gap-1.5 text-left">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">กรุณาตรวจสอบชื่อบัญชีให้ถูกต้องก่อนโอนเงินทุกครั้ง</span>
          </div>
        </div>
      )}
    </div>
  );
}
