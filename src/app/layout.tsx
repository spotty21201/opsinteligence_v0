import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { ToastViewport } from '@/components/ui/toast-provider';

export const metadata: Metadata = {
  title: '3Sigma Ops Intelligence',
  description: 'Map-first operations cockpit for 3Sigma',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4">{children}</main>
          <ToastViewport />
        </div>
      </body>
    </html>
  );
}
