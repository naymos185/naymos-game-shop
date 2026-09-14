import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const prompt = Prompt({
  variable: '--font-prompt',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'NayMos GameShop | บริการเติมเกมออนไลน์ น่ารัก สะดวก ปลอดภัย 100%',
    template: '%s | NayMos GameShop',
  },
  description:
    'ร้านเติมเกมออนไลน์ NayMos GameShop เติม Free Fire, RoV, Mobile Legends, Valorant และเกมอื่นๆ รวดเร็ว ราคาคุ้มค่า ปลอดภัย 100% ดูแลตลอด 24 ชม.',
  openGraph: {
    title: 'NayMos GameShop — บริการเติมเกมออนไลน์',
    description: 'เติมง่าย สะดวก ปลอดภัย 100% ราคาคุ้มค่า ทันใจในไม่กี่นาที',
    type: 'website',
    locale: 'th_TH',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${prompt.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#f0f9ff] text-slate-800">
        {children}
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
