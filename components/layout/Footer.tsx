import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎮</span>
              <span className="font-bold">
                <span className="text-blue-600">NayMos</span>
                <span className="text-slate-800"> GameShop</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              ร้านเติมเกมออนไลน์ที่เชื่อถือได้ รวดเร็ว ปลอดภัย ราคาดี
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">เมนู</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="/games" className="hover:text-blue-600 transition">
                  เกมทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="hover:text-blue-600 transition">
                  โปรโมชั่น
                </Link>
              </li>
              <li>
                <Link href="/how-to" className="hover:text-blue-600 transition">
                  วิธีเติมเกม
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-600 transition">
                  คำถามที่พบบ่อย
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">บัญชี</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="/login" className="hover:text-blue-600 transition">
                  เข้าสู่ระบบ
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-600 transition">
                  สมัครสมาชิก
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="hover:text-blue-600 transition">
                  ติดตามออเดอร์
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-blue-600 transition">
                  บัญชีของฉัน
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">ติดต่อเรา</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Line: @naymos</li>
              <li>Facebook: NayMos GameShop</li>
              <li>เปิดบริการ 24 ชม.</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NayMos GameShop. All rights reserved.</p>
          <p>เติมเกมเร็ว ปลอดภัย มั่นใจได้</p>
        </div>
      </div>
    </footer>
  );
}
