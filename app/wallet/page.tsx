'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function WalletRedirectPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/wallet'); }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
