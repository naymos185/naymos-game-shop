'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-slate-900">เกิดข้อผิดพลาด</h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          ขออภัย ระบบพบปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
