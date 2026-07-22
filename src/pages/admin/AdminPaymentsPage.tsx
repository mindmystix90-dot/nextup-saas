import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';
import { Card, Badge, EmptyState, Spinner } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { fetchAllPayments } from '@/services/admin.service';
import type { Payment, PaymentStatus } from '@/types';

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    (async () => {
      try { setPayments(await fetchAllPayments()); }
      catch { toast.error('Failed to load payments'); }
      finally { setLoading(false); }
    })();
  }, []);

  const statusVariant = (s: PaymentStatus) =>
    s === 'completed' ? 'success' : s === 'pending' ? 'warning' : s === 'refunded' ? 'secondary' : 'danger';

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Payments</h1>
        <p className="text-muted-foreground mt-1">All payment transactions.</p>
      </div>

      <Card>
        {payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments yet" description="Payment transactions will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Method</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3">
                      <p className="font-medium">{p.user_name}</p>
                      <p className="text-xs text-muted-foreground">{p.user_email}</p>
                    </td>
                    <td className="py-3"><Badge variant="secondary">{p.type}</Badge></td>
                    <td className="py-3">{p.item_name}</td>
                    <td className="py-3 font-semibold">{formatCurrency(p.amount)}</td>
                    <td className="py-3"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                    <td className="py-3 uppercase text-xs">{p.method}</td>
                    <td className="py-3 text-muted-foreground">{formatDateTime(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
