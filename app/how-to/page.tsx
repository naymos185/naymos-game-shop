import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Sparkles, Gamepad2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'วิธีเติมเกม | NayMos GameShop',
  description: 'ขั้นตอนการเติมเกมออนไลน์กับ NayMos GameShop ง่าย รวดเร็ว ปลอดภัย 100%',
};

const STEPS = [
  { n: '1', title: 'เลือกเกมที่ต้องการ', desc: 'ไปที่เมนูเกมทั้งหมด แล้วเลือกเกมที่คุณต้องการเติม เช่น Free Fire, RoV, MLBB, Valorant' },
  { n: '2', title: 'เลือกแพ็กเกจ', desc: 'เลือกจำนวนเพชร คูปอง หรือไอเทมที่ต้องการตามงบประมาณของคุณ' },
  { n: '3', title: 'กรอกข้อมูลผู้เล่น', desc: 'ใส่ UID, Open ID หรือ Zone ID ตามที่เกมนั้นๆ กำหนดให้ถูกต้อง' },
  { n: '4', title: 'ชำระเงิน', desc: 'สแกน QR PromptPay หรือชำระผ่านช่องทางที่ร้านรองรับ ยอดตรงตามระบบ' },
  { n: '5', title: 'รับไอเทมเข้าเกม', desc: 'หลังชำระเงินสำเร็จ ระบบจะดำเนินการเติมให้อัตโนมัติในไม่กี่นาที' },
];

export default function HowToPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>คำแนะนำการใช้งาน</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            วิธีเติมเกม
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            ขั้นตอนง่ายๆ เพียง 5 ขั้นตอน เติมไว ปลอดภัย 100%
          </p>
        </div>

        <div className="space-y-3.5">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="flex items-start gap-4 rounded-3xl border border-sky-100 bg-white p-5 shadow-xs hover:border-sky-200 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs shadow-sky-200">
                {s.n}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h2 className="font-extrabold text-base text-slate-800 mb-1">
                  {s.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 px-6 py-3 font-bold text-sm text-white shadow-md shadow-sky-200 hover:shadow-lg active:scale-95 transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>เริ่มเติมเกมตอนนี้</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
