import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'วิธีเติมเกม' };

const STEPS = [
  { n: '1', title: 'เลือกเกม', desc: 'ไปที่หน้าเกมทั้งหมด แล้วเลือกเกมที่ต้องการเติม เช่น Free Fire, RoV, MLBB' },
  { n: '2', title: 'เลือกแพ็กเกจ', desc: 'เลือกจำนวนเพชร / คูปอง / Diamonds ตามที่ต้องการ' },
  { n: '3', title: 'กรอกข้อมูลผู้เล่น', desc: 'ใส่ UID, Open ID หรือ User ID + Zone ID ตามเกมนั้นๆ ให้ถูกต้อง' },
  { n: '4', title: 'ยืนยันและชำระเงิน', desc: 'ตรวจสอบยอด แล้วสแกน QR PromptPay หรือชำระผ่านช่องทางที่รองรับ' },
  { n: '5', title: 'รอระบบเติม', desc: 'หลังชำระเงินสำเร็จ ระบบจะส่งเข้า Provider อัตโนมัติ ไอเทมเข้าเกมภายในไม่กี่นาที' },
];

export default function HowToPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">วิธีเติมเกม</h1>
        <p className="text-zinc-400 mb-10">ขั้นตอนง่ายๆ เพียง 5 ขั้น</p>
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0">
                {s.n}
              </div>
              <div>
                <h2 className="font-semibold mb-1">{s.title}</h2>
                <p className="text-sm text-zinc-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/games" className="inline-flex rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 font-bold text-white transition">
            เริ่มเติมเกมเลย
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
