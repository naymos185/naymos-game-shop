import { Header } from './Header';
import { Footer } from './Footer';

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
