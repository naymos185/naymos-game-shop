import { Header } from './Header';
import { Footer } from './Footer';

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-sky-50/50 text-slate-800 relative overflow-hidden">
      {/* Decorative background sparkles and soft clouds */}
      <div className="absolute top-0 left-0 right-0 h-96 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_#bae6fd_0%,_transparent_70%)]" />
      <Header />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
