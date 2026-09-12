import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'NayMos GameShop | เติมเกมออนไลน์ รวดเร็ว ปลอดภัย',
    template: '%s | NayMos GameShop',
  },
  description:
    'ร้านเติมเกมออนไลน์ NayMos GameShop เติม Free Fire, RoV, Mobile Legends, Valorant และเกมอื่นๆ รวดเร็ว ราคาดี ปลอดภัย 24 ชม.',
  openGraph: {
    title: 'NayMos GameShop',
    description: 'เติมเกมออนไลน์ รวดเร็ว ปลอดภัย ราคาดี',
    type: 'website',
    locale: 'th_TH',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
