import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <ConfirmProvider>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-slate-200 flex items-center px-4 sm:px-6 shrink-0 bg-white">
            <h1 className="text-sm font-medium text-slate-600">
              NayMos GameShop — Backoffice
            </h1>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </div>
      </ConfirmProvider>
    </div>
  );
}
