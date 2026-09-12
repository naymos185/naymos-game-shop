import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'คำถามที่พบบ่อย' };

const FAQS = [
  { q: 'เติมเกมนานแค่ไหน?', a: 'โดยปกติหลังชำระเงินสำเร็จ ระบบจะเติมอัตโนมัติภายใน 1–5 นาที ขึ้นอยู่กับ Provider' },
  { q: 'ต้องสมัครสมาชิกไหม?', a: 'ไม่จำเป็น สามารถเติมแบบ Guest ได้ แต่สมัครสมาชิกจะได้ประวัติออเดอร์ คะแนน และบันทึก UID' },
  { q: 'ถากรอก UID ผิดจะทำอย่างไร?', a: 'หากกรอกผิดและระบบเติมไปแล้วทางร้านไม่สามารถกู้คืนได้ กรุณาตรวจสอบให้ถูกต้องก่อนยืนยัน' },
  { q: 'ชำระเงินแล้วแต่ยังไม่ได้รับ?', a: 'ตรวจสอบสถานะที่หน้าติดตามออเดอร์ หากเกิน 15 นาที ติดต่อ Support พร้อมหมายเลขออเดอร์' },
  { q: 'รองรับเกมอะไรบ้าง?', a: 'Free Fire, RoV, Mobile Legends, Valorant, Genshin Impact, PUBG Mobile และจะเพิ่มเกมใหม่จากหลังบ้านได้' },
  { q: 'ราคาถูกกว่าในเกมไหม?', a: 'เรารักษาราคาแข่งขันได้ และมีโปรโมชั่นเป็นระยะ ดูได้ที่หน้าโปรโมชั่น' },
];

export default function FaqPage() {
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">คำถามที่พบบ่อย</h1>
        <p className="text-zinc-400 mb-10">FAQ — NayMos GameShop</p>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-zinc-800 bg-zinc-900 open:border-red-600/30">
              <summary className="cursor-pointer list-none px-5 py-4 font-medium text-sm flex justify-between items-center">
                {f.q}
                <span className="text-zinc-500 group-open:rotate-45 transition text-lg">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
