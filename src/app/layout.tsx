import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arcane Academy - โรงเรียนเวทมนตร์ปราสาทลอยฟ้า',
  description:
    'สวมบทบาทเป็นนักเรียนโรงเรียนเวทมนตร์ ทำภารกิจ ปลดล็อกคาถา ปรับแต่งตัวละคร และก้าวขึ้นสู่จอมเวทอันดับหนึ่งแห่ง Arcane Academy',
  keywords: ['Arcane Academy', 'เกมเวทมนตร์', 'Magic Game', 'Fantasy Web Game', 'Next.js Game'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#0a0614] text-gray-100 antialiased selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
