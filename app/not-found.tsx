import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-7xl font-black text-blue-600">404</div>
        <h1 className="text-2xl font-bold">ไม่พบหน้านี้</h1>
        <p className="text-slate-500">หน้าที่คุณค้นหาอาจถูกลบ หรือ URL ไม่ถูกต้อง</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
          >
            กลับหน้าหลัก
          </Link>
          <Link
            href="/account"
            className="inline-block px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition"
          >
            บัญชีของฉัน
          </Link>
        </div>
      </div>
    </div>
  );
}
