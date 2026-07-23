import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NextUp — Learn Skills. Build Your Future. Unlock Opportunities.',
  description:
    'Master practical skills, earn certificates, join a supportive learning community, and unlock career opportunities with NextUp.',
  keywords: [
    'online courses',
    'certificates',
    'career growth',
    'learning community',
    'skill development',
  ],
  openGraph: {
    title: 'NextUp — Learn Skills. Build Your Future.',
    description:
      'Master practical skills, earn certificates, join a supportive learning community, and unlock career opportunities.',
    type: 'website',
  },
};

import { Suspense } from 'react';
import { ReferralTracker } from '@/components/affiliate/referral-tracker';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <Suspense fallback={null}>
            <ReferralTracker />
          </Suspense>
          {children}
        </AuthProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
