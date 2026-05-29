// src/app/layout.tsx
import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { MobileNav } from '@/components/layout/MobileNav';

import QueryProvider from '@/components/providers/query-provider';
import { LanguageProvider } from '@/lib/language-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Impr0ve – Productivity Suite',
  description: 'Premium productivity SaaS platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gray-950 text-gray-100 flex h-screen overflow-hidden`}
      >
        <QueryProvider>
          <StoreProvider>
            <AuthProvider>
              <LanguageProvider>
                <Sidebar />
                <MobileNav />
                <main className="flex-1 min-h-0 overflow-y-auto px-4 py-20 lg:p-8 transition-all duration-300">
                  {children}
                </main>
                <Toaster />
              </LanguageProvider>
            </AuthProvider>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

