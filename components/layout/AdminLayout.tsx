import Link from 'next/link';
import { Globe, ArrowLeft } from 'lucide-react';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-sky-50/50 via-slate-50 to-sky-50/30 text-slate-800">
      <ConfirmProvider>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-sky-100 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-xs">
            <h1 className="text-sm font-bold text-slate-800">
              NayMos GameShop <span className="text-sky-500 font-normal">— Backoffice</span>
            </h1>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 transition shadow-xs"
              title="กลับไปหน้าหลักของเว็บไซต์"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
              <span>กลับสู่หน้าเว็บ</span>
              <Globe className="h-3.5 w-3.5 text-sky-500" />
            </Link>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </div>
      </ConfirmProvider>
    </div>
  );
}
