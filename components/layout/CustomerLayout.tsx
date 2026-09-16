import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingChatWidget } from '@/components/chat/FloatingChatWidget';
import { getSessionUser } from '@/lib/auth/get-user';

export async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const currentUser = user
    ? {
        id: user.id,
        email: user.email ?? null,
        full_name: (user.user_metadata?.full_name as string) ?? null,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-sky-50/50 text-slate-800 relative overflow-hidden">
      {/* Decorative background sparkles and soft clouds */}
      <div className="absolute top-0 left-0 right-0 h-96 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_#bae6fd_0%,_transparent_70%)]" />
      <Header />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
      {/* Floating Chat Widget with cute shark and notifications */}
      <FloatingChatWidget currentUser={currentUser} />
    </div>
  );
}
