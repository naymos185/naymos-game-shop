import { CustomerLayout } from '@/components/layout/CustomerLayout';
import type { Metadata } from 'next';
import { SupportForm } from '@/components/customer/SupportForm';
import { getSessionUser } from '@/lib/auth/get-user';
import { MessageCircle, Facebook } from 'lucide-react';

export const metadata: Metadata = { title: 'ติดต่อซัพพอร์ต' };
export const revalidate = 60;

export default async function SupportPage() {
  const user = await getSessionUser();

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">ติดต่อซัพพอร์ต</h1>
        <p className="text-sm text-slate-500 mb-6">
          มีปัญหาออเดอร์หรือการเติมเกม แจ้งได้ที่นี่ หรือติดต่อผ่านช่องทางโซเชียลได้ตลอด 24 ชั่วโมง
        </p>

        {/* Contact channels card */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/50 p-4 mb-6 shadow-xs">
          <p className="text-xs font-bold text-sky-950 mb-2.5">ช่องทางติดต่อด่วน</p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-700 shadow-2xs">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>LINE:</span>
              <span className="text-slate-800">@naymosgameshop</span>
            </div>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs font-bold text-sky-700 hover:bg-sky-50 transition shadow-2xs"
            >
              <Facebook className="w-4 h-4 text-sky-600 shrink-0" />
              <span>เพจ:</span>
              <span className="text-slate-800 truncate">NayMosGameShop-บริการเติมเกมออนไลน์</span>
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
          <SupportForm defaultEmail={user?.email} />
        </div>
      </div>
    </CustomerLayout>
  );
}
