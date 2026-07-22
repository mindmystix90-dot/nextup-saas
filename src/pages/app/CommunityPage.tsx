import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  MessageSquare, Heart, Trash2, MessageCircle, Plus, Send,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Card, Badge, EmptyState, Spinner, Button, Input, Textarea, Select, Avatar,
} from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import {
  fetchPosts, createPost, deletePost, fetchComments, addComment, toggleLike, checkLiked,
} from '@/services/community.service';
import type { CommunityPost, CommunityComment } from '@/types';

const CATEGORIES = ['General', 'Question', 'Showcase', 'Discussion', 'Tips'];

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<string, CommunityComment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (!user) return;
    try {
      const p = await fetchPosts();
      setPosts(p);
      // check liked status for each
      const liked: Record<string, boolean> = {};
      await Promise.all(p.map(async (post) => {
        liked[post.id] = await checkLiked(post.id, user.id);
      }));
      setLikedPosts(liked);
    } catch {
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!title.trim() || !content.trim()) { toast.error('Title and content are required'); return; }
    setSubmitting(true);
    const res = await createPost(user.id, profile.name, profile.photo_url, title, content, category);
    setSubmitting(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success('Post created!');
    setShowForm(false); setTitle(''); setContent(''); setCategory('General');
    loadPosts();
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    const res = await deletePost(postId, user.id);
    if (res.error) { toast.error(res.error); return; }
    toast.success('Post deleted');
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const { liked } = await toggleLike(postId, user.id);
    setLikedPosts((p) => ({ ...p, [postId]: liked }));
    setPosts((prev) => prev.map((p) => p.id === postId
      ? { ...p, likes_count: Math.max(0, p.likes_count + (liked ? 1 : -1)) }
      : p));
  };

  const toggleComments = async (postId: string) => {
    if (expanded === postId) { setExpanded(null); return; }
    setExpanded(postId);
    const c = await fetchComments(postId);
    setOpenComments((p) => ({ ...p, [postId]: c }));
  };

  const handleComment = async (postId: string) => {
    if (!user || !profile) return;
    const text = (commentText[postId] ?? '').trim();
    if (!text) return;
    const res = await addComment(postId, user.id, profile.name, profile.photo_url, text);
    if (res.error) { toast.error(res.error); return; }
    setCommentText((p) => ({ ...p, [postId]: '' }));
    const c = await fetchComments(postId);
    setOpenComments((p) => ({ ...p, [postId]: c }));
    setPosts((prev) => prev.map((p) => p.id === postId
      ? { ...p, comments_count: p.comments_count + 1 } : p));
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Community</h1>
          <p className="text-muted-foreground mt-1">Connect, share, and learn with others.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Title" value={title} onChange={setTitle} placeholder="Post title" required />
            <Textarea label="Content" value={content} onChange={setContent} placeholder="Share your thoughts..." rows={4} />
            <Select label="Category" value={category} onChange={setCategory}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Posting...' : 'Post'}</Button>
            </div>
          </form>
        </Card>
      )}

      {posts.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No posts yet" description="Be the first to start a conversation!" />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="flex items-start gap-3">
                <Avatar name={post.user_name} src={post.user_avatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-medium">{post.user_name}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.category && <Badge variant="secondary">{post.category}</Badge>}
                      {post.pinned && <Badge variant="warning">Pinned</Badge>}
                      {user && post.user_id === user.id && (
                        <button onClick={() => handleDelete(post.id)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold font-display mt-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{post.content}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 text-sm ${likedPosts[post.id] ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Heart className={`h-4 w-4 ${likedPosts[post.id] ? 'fill-current' : ''}`} /> {post.likes_count}
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <MessageCircle className="h-4 w-4" /> {post.comments_count} Comments
                    </button>
                  </div>

                  {expanded === post.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {(openComments[post.id] ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No comments yet.</p>
                      ) : (
                        (openComments[post.id] ?? []).map((c) => (
                          <div key={c.id} className="flex items-start gap-2">
                            <Avatar name={c.user_name} src={c.user_avatar} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="bg-secondary/30 rounded-lg p-2.5">
                                <p className="text-sm font-medium">{c.user_name}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">{c.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{timeAgo(c.created_at)}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          value={commentText[post.id] ?? ''}
                          onChange={(e) => setCommentText((p) => ({ ...p, [post.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                          placeholder="Write a comment..."
                          className="input-field flex-1 text-sm"
                        />
                        <Button onClick={() => handleComment(post.id)} className="px-3">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
