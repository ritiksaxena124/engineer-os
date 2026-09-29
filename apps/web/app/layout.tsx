import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/session';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'EngineerOS',
  description: 'A mentor operating system for becoming a senior engineer.',
};

export const viewport: Viewport = { themeColor: '#0b0d10' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-canvas text-ink">
        <SessionProvider>{children}</SessionProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4_000,
            style: {
              background: '#15191e',
              border: '1px solid #2b323b',
              borderRadius: 6,
              color: '#e6e9ee',
              fontSize: 13,
            },
            success: { iconTheme: { primary: '#3fb950', secondary: '#15191e' } },
            error: { iconTheme: { primary: '#f85149', secondary: '#15191e' } },
          }}
        />
      </body>
    </html>
  );
}
