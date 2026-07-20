'use client';

import { useMemo, useState } from 'react';
import { Users as UsersIcon, Search, Pin, Flag, Trash2, MessageSquare } from 'lucide-react';
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
import { adminCommunityPosts } from '@/lib/data/admin';
import { toast } from 'sonner';

export default function AdminCommunityPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => {
    return adminCommunityPosts.filter((p) => {
      const matchQuery =
        p.author.toLowerCase().includes(query.toLowerCase()) ||
        p.topic.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase());
      const matchStatus = status === 'all' || p.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={UsersIcon}
        title="Community"
        subtitle="Moderate discussions, pin helpful posts and handle flagged content."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total posts</p>
          <p className="font-display text-xl font-bold">{adminCommunityPosts.length}</p>
        </CardContent></Card>
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="font-display text-xl font-bold text-success">{adminCommunityPosts.filter((p) => p.status === 'Active').length}</p>
        </CardContent></Card>
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Flagged</p>
          <p className="font-display text-xl font-bold text-destructive">{adminCommunityPosts.filter((p) => p.status === 'Flagged').length}</p>
        </CardContent></Card>
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Pinned</p>
          <p className="font-display text-xl font-bold text-primary">{adminCommunityPosts.filter((p) => p.status === 'Pinned').length}</p>
        </CardContent></Card>
      </div>

      <Card className="card-premium">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">All posts ({filtered.length})</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search author, topic, category…"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pinned">Pinned</SelectItem>
                <SelectItem value="Flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Replies</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Reports</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={p.avatar} alt={p.author} />
                        <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                          {p.author.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{p.author}</p>
                        <p className="text-xs text-muted-foreground">{p.time}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{p.topic}</p>
                    <p className="text-xs text-muted-foreground">{p.id}</p>
                  </TableCell>
                  <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                  <TableCell className="text-right">{p.replies}</TableCell>
                  <TableCell className="text-right">{p.likes}</TableCell>
                  <TableCell className="text-right">
                    {p.reports > 0 ? <span className="text-destructive font-medium">{p.reports}</span> : '0'}
                  </TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success(`Pinned ${p.id} (demo)`)}>
                        <Pin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-warning hover:text-warning" onClick={() => toast.info(`Flagged ${p.id} (demo)`)}>
                        <Flag className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => toast.error(`Removed ${p.id} (demo)`)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No posts match your filters.
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
