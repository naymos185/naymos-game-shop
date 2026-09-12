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
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-red-500">เกิดข้อผิดพลาด</h1>
        <p className="text-zinc-400">
          ขออภัย ระบบพบปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition"
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
