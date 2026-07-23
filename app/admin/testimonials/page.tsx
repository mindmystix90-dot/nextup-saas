'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Search, Plus, Pencil, Trash2, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminPageHeader, StatusBadge } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  review: string;
  rating: number;
  status: 'Published' | 'Pending' | 'Hidden';
  avatar?: string;
}

export default function AdminTestimonialsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return testimonials.filter((t) => {
      const matchQuery =
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.role.toLowerCase().includes(query.toLowerCase()) ||
        t.review.toLowerCase().includes(query.toLowerCase());
      const matchStatus = status === 'all' || t.status === status;
      return matchQuery && matchStatus;
    });
  }, [testimonials, query, status]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={MessageSquare}
        title="Testimonials"
        subtitle="Moderate, approve and feature student reviews."
        actions={
          <Button size="sm" className="bg-brand-gradient font-semibold" onClick={() => toast.info('Add testimonial (demo)')}>
            <Plus className="h-4 w-4 mr-1" /> Add testimonial
          </Button>
        }
      />

      <Card className="card-premium">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">All testimonials ({filtered.length})</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, role, review…"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={t.avatar} alt={t.name} />
                        <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                          {t.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < t.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/40'}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-muted-foreground line-clamp-2">{t.review}</p>
                  </TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Edit ${t.name} (demo)`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => toast.error(`Delete ${t.name} (demo)`)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No testimonials match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
