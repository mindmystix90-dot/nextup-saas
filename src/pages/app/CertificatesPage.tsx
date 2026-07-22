import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Award, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, EmptyState, Spinner } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Certificate } from '@/types';

export default function CertificatesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false });
        if (error) throw error;
        if (active) setCertificates((data as Certificate[]) ?? []);
      } catch {
        if (active) toast.error('Failed to load certificates');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Certificates</h1>
        <p className="text-muted-foreground mt-1">Your earned certificates from completed courses.</p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet."
          description="Complete courses to earn certificates and they'll appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <Card key={cert.id} className="text-center">
              <div className="p-4 rounded-2xl bg-purple-500/10 w-fit mx-auto mb-4">
                <Award className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-semibold font-display text-lg">{cert.course_title}</h3>
              <p className="text-sm text-muted-foreground mt-1">Issued {formatDate(cert.issued_at)}</p>
              <div className="mt-3">
                <Badge variant="secondary">ID: {cert.certificate_id}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Certificate of Completion awarded to {cert.user_name}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
