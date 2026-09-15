'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[NayMos Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/50 text-slate-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 rounded-3xl border border-sky-100 bg-white/90 p-8 shadow-xl shadow-sky-100/50 backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900">เกิดข้อผิดพลาดชั่วคราว</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            ขออภัย ระบบพบปัญหาชั่วคราว กรุณากดลองใหม่อีกครั้ง
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 rounded-full text-sm font-bold text-white shadow-md shadow-sky-200/50 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-sky-50 border border-sky-200 rounded-full text-sm font-semibold text-slate-700 shadow-xs transition"
          >
            <Home className="w-4 h-4" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
