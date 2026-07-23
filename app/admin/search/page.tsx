'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { universalAdminSearch, type AdminSearchResult } from '@/services/admin-search.service';
import { toast } from 'sonner';

export default function AdminSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      universalAdminSearch(term)
        .then((data) => {
          if (mounted) setResults(data);
        })
        .catch(() => toast.error('Admin search failed'))
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Search}
        title="Universal Search"
        subtitle="Search Firestore records by user, payment, order, affiliate, sales partner, enrollment, support ticket, certificate, coupon, name, phone, email, or referral code."
      />

      <Card className="card-premium">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">Search admin records</CardTitle>
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search User ID, Firebase UID, Payment ID, Order ID, Affiliate ID, Sales Partner ID, Enrollment ID, Support Ticket ID, Certificate ID, name, phone, email, referral code…"
              className="pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {query.trim().length < 2 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium text-foreground">Enter at least 2 characters</p>
              <p className="mt-1 text-sm">Search results are loaded from Firestore only.</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium text-foreground">No matching records</p>
              <p className="mt-1 text-sm">No Firestore records matched “{query.trim()}”.</p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {results.map((result) => (
                <Link key={`${result.type}-${result.id}`} href={result.href} className="block p-4 hover:bg-secondary transition-colors">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{result.type}</Badge>
                        <p className="font-medium text-foreground">{result.title}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{result.subtitle}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Matched: {result.matchedFields.join(', ')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
