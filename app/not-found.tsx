import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-7xl font-black text-red-600">404</div>
        <h1 className="text-2xl font-bold">ไม่พบหน้านี้</h1>
        <p className="text-zinc-400">หน้าที่คุณค้นหาอาจถูกลบ หรือ URL ไม่ถูกต้อง</p>
        <Link href="/" className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition">
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
