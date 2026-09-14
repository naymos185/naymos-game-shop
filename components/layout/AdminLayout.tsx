import Link from 'next/link';
import { Globe, ArrowLeft } from 'lucide-react';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      <ConfirmProvider>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white/50">
            <h1 className="text-sm font-medium text-zinc-300">
              NayMos GameShop — Backoffice
            </h1>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
              title="กลับไปหน้าหลักของเว็บไซต์"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-zinc-400" />
              <span>กลับสู่หน้าเว็บ</span>
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
            </Link>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </div>
      </ConfirmProvider>
    </div>
  );
}
