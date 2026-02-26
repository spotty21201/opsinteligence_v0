import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { ToastViewport } from '@/components/ui/toast-provider';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '3Sigma Ops Intelligence',
  description: 'Map-first operations cockpit for 3Sigma',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <div className="min-h-screen md:flex">
          <Sidebar />
          <main className="flex-1 p-3 md:p-4">{children}</main>
          <ToastViewport />
        </div>
      </body>
    </html>
  );
}
