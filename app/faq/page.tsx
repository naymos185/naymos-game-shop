import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import { Sparkles, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'คำถามที่พบบ่อย | NayMos GameShop',
  description: 'รวมคำถามที่พบบ่อยเกี่ยวกับการเติมเกม ข้อสงสัย และบริการของ NayMos GameShop',
};

const FAQS = [
  { q: 'เติมเกมนานแค่ไหน?', a: 'โดยปกติหลังชำระเงินสำเร็จ ระบบอัตโนมัติจะเติมไอเทมให้ภายใน 1–5 นาที ขึ้นอยู่กับคิวและสถานะเซิร์ฟเวอร์' },
  { q: 'ต้องสมัครสมาชิกก่อนไหม?', a: 'เพื่อความปลอดภัยสูงสุดและป้องกันข้อมูลสูญหาย แนะนำให้สมัครสมาชิกก่อนทำรายการ จะได้บันทึกประวัติและสะสมแต้มได้ด้วย' },
  { q: 'หากกรอก UID ผิดจะทำอย่างไร?', a: 'หากระบบทำการเติมเข้าไอดีปลายทางไปแล้ว จะไม่สามารถดึงคืนได้ กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันชำระเงินทุกครั้ง' },
  { q: 'ชำระเงินแล้วแต่ยังไม่ได้รับไอเทม?', a: 'สามารถตรวจสอบสถานะได้ที่หน้าติดตามออเดอร์ หากเกิน 15 นาที ติดต่อฝ่ายบริการลูกค้าทาง LINE ได้ตลอด 24 ชั่วโมง' },
  { q: 'รองรับการเติมเกมอะไรบ้าง?', a: 'Free Fire, RoV, Mobile Legends, Valorant, Genshin Impact, PUBG Mobile และมีเกมใหม่ๆ ทยอยเพิ่มเข้ามาเรื่อยๆ' },
  { q: 'ราคาถูกกว่าเติมในเกมจริงไหม?', a: 'ทางร้านจัดโปรโมชั่นและส่วนลดพิเศษอย่างสม่ำเสมอ ทำให้คุณได้ราคาที่คุ้มค่ากว่าเติมผ่าน Store โดยตรง' },
];

export default function FaqPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ศูนย์ช่วยเหลือ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            คำถามที่พบบ่อย
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            FAQ — ไขทุกข้อสงสัยเกี่ยวกับบริการ NayMos GameShop
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-3xl border border-sky-100 bg-white open:border-sky-300 open:shadow-md open:shadow-sky-100 transition-all duration-200 shadow-xs overflow-hidden"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-bold text-sm text-slate-800 flex justify-between items-center select-none hover:text-sky-600 transition-colors">
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-sky-500 shrink-0" />
                  {f.q}
                </span>
                <span className="text-sky-400 group-open:rotate-45 transition-transform duration-200 text-xl font-bold shrink-0 ml-2">
                  +
                </span>
              </summary>
              <div className="px-5 pb-4 pt-1 border-t border-sky-50 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed bg-sky-50/40">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
