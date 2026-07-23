'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users as UsersIcon, Search, Pin, Flag, Trash2, MessageSquare, Loader2 } from 'lucide-react';
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
import { fetchDiscussions, deleteDiscussion } from '@/services/community.service';
import type { Discussion } from '@/types';
import { toast } from 'sonner';

export default function AdminCommunityPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [posts, setPosts] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await fetchDiscussions();
      setPosts(data);
    } catch {
      toast.error('Failed to load community discussions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPosts(); }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const authorName = p.name || p.authorName || 'Anonymous';
      const postTopic = p.topic || p.title || '';
      const postCategory = p.category || '';
      const matchQuery =
        authorName.toLowerCase().includes(query.toLowerCase()) ||
        postTopic.toLowerCase().includes(query.toLowerCase()) ||
        postCategory.toLowerCase().includes(query.toLowerCase());
      return matchQuery;
    });
  }, [posts, query]);

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
          <p className="font-display text-xl font-bold">{posts.length}</p>
        </CardContent></Card>
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="font-display text-xl font-bold text-success">{posts.length}</p>
        </CardContent></Card>
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Flagged</p>
          <p className="font-display text-xl font-bold text-destructive">0</p>
        </CardContent></Card>
        <Card className="card-premium"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Pinned</p>
          <p className="font-display text-xl font-bold text-primary">0</p>
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
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No community posts found in Firestore.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Replies</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, idx) => {
                  const authorName = p.name || p.authorName || 'Anonymous';
                  const postTopic = p.topic || p.title || 'Untitled Post';
                  return (
                    <TableRow key={p.id || idx}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                              {authorName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{authorName}</p>
                            <p className="text-xs text-muted-foreground">{p.timeAgo || p.time || 'Recently'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{postTopic}</p>
                        <p className="text-xs text-muted-foreground">{p.id || 'N/A'}</p>
                      </TableCell>
                      <TableCell><Badge variant="outline">{p.category || 'General'}</Badge></TableCell>
                      <TableCell className="text-right">{p.replies ?? p.repliesCount ?? 0}</TableCell>
                      <TableCell className="text-right">{p.likes ?? p.likesCount ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                          if (!p.id) return;
                          try {
                            await deleteDiscussion(p.id);
                            toast.success('Deleted post');
                            loadPosts();
                          } catch {
                            toast.error('Failed to delete post');
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
