import Link from 'next/link';
import { ShieldCheck, Zap, Headphones, Diamond, Heart, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-sky-100 bg-white/80 backdrop-blur-md mt-auto">
      {/* Upper kawaii trust bar with clean Lucide icons */}
      <div className="border-b border-sky-100/70 bg-gradient-to-r from-sky-50 via-white to-sky-50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-sky-900">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-sky-100 text-sky-600"><ShieldCheck className="w-4 h-4" /></span>
            <span>ปลอดภัย 100% ไม่ต้องใช้รหัสผ่าน</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-sky-100 text-sky-600"><Zap className="w-4 h-4" /></span>
            <span>เติมไว ทันใจในไม่กี่นาที</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-sky-100 text-sky-600"><Diamond className="w-4 h-4" /></span>
            <span>ราคาคุ้มค่า ถูกกว่าซื้อเอง</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-sky-100 text-sky-600"><Headphones className="w-4 h-4" /></span>
            <span>บริการ 24 ชม. พร้อมดูแลทุกเคส</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 p-0.5 overflow-hidden shadow-xs">
                <img
                  src="/images/logo.png"
                  alt="NayMos GameShop"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-base text-sky-950">
                NayMos <span className="text-sky-500">GameShop</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">
              ร้านเติมเกมออนไลน์สุดคุ้ม น่ารัก สะดวก ปลอดภัย 100% ดูแลด้วยใจตลอด 24 ชั่วโมง
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
              <span>LINE:</span>
              <span>@naymosgameshop</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sky-950 mb-3 text-sm">เมนูหลัก</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/games" className="hover:text-sky-600 transition">เกมทั้งหมด</Link></li>
              <li><Link href="/promotions" className="hover:text-sky-600 transition">โปรโมชั่นสุดพิเศษ</Link></li>
              <li><Link href="/how-to" className="hover:text-sky-600 transition">วิธีเติมเกม</Link></li>
              <li><Link href="/faq" className="hover:text-sky-600 transition">คำถามที่พบบ่อย</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sky-950 mb-3 text-sm">บริการลูกค้า</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/order-tracking" className="hover:text-sky-600 transition">ติดตามสถานะออเดอร์</Link></li>
              <li><Link href="/account" className="hover:text-sky-600 transition">บัญชีผู้ใช้งาน</Link></li>
              <li><Link href="/support" className="hover:text-sky-600 transition">แจ้งปัญหา / ติดต่อเรา</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sky-950 mb-3 text-sm">ความปลอดภัย</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              ระบบตรวจสอบสลิปอัตโนมัติ รวดเร็ว ปลอดภัย ไร้กังวล เติมตรงถึงบัญชีของคุณ
            </p>
            <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-sky-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>มั่นใจทุกการเติม เติมง่าย ไวสุดๆ</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NayMos GameShop. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-sky-400 fill-sky-400" /> for Gamers
          </p>
        </div>
      </div>
    </footer>
  );
}
