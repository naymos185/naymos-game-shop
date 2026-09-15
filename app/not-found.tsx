import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/50 text-slate-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 rounded-3xl border border-sky-100 bg-white/90 p-8 shadow-xl shadow-sky-100/50 backdrop-blur-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner">
          <Compass className="w-8 h-8" />
        </div>
        <div className="text-7xl font-black bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
          404
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900">ไม่พบหน้านี้</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            หน้าที่คุณค้นหาอาจถูกย้าย ลบออกไปแล้ว หรือพิมพ์ URL ไม่ถูกต้อง
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 px-7 py-3 text-sm font-bold text-white shadow-md shadow-sky-200/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
