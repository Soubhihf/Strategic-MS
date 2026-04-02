import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Executive OS — المنظومة التنفيذية الموحدة',
  description:
    'نظام القيادة التنفيذي الموحد — إدارة المشاريع والمالية والفريق والتخطيط الاستراتيجي',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#04070f" />
      </head>
      <body className={`${cairo.className} bg-[#04070f] text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}
