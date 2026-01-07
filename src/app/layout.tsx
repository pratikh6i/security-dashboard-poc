import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/ThemeContext';
import { AuthProvider } from '@/lib/AuthContext';
import { ClientProvider } from '@/lib/ClientContext';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CloudGuard SIEM - GCP Security Dashboard',
  description: 'Multi-client security information and event management for GCP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ClientProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </ClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
