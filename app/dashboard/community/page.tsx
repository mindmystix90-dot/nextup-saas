'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Video, Sparkles, TrendingUp, Users, HelpCircle, Search, ThumbsUp, Reply, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { fetchDiscussions, fetchMentorPosts, fetchStudentQuestions } from '@/services/community.service';
import { fetchLiveClasses } from '@/services/live-classes.service';
import type { Discussion, MentorPost, StudentQuestion, LiveClassSession } from '@/types';
import { toast } from 'sonner';

const TABS = ['Discussions', 'Mentor Posts', 'Questions'] as const;
type Tab = (typeof TABS)[number];

const trendingTopics = ['Next.js', 'Firebase', 'React', 'Fullstack', 'Design Systems'];

export default function DashboardCommunityPage() {
  const [tab, setTab] = useState<Tab>('Discussions');
  const [query, setQuery] = useState('');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [mentorPostsList, setMentorPostsList] = useState<MentorPost[]>([]);
  const [questionsList, setQuestionsList] = useState<StudentQuestion[]>([]);
  const [liveClassesList, setLiveClassesList] = useState<LiveClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [d, m, q, lc] = await Promise.all([
          fetchDiscussions(),
          fetchMentorPosts(),
          fetchStudentQuestions(),
          fetchLiveClasses(),
        ]);
        setDiscussions(d);
        setMentorPostsList(m);
        setQuestionsList(q);
        setLiveClassesList(lc);
      } catch {
        toast.error('Failed to load community data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredDiscussions = discussions.filter((d) => {
    const title = d.title || d.topic || '';
    const author = d.authorName || d.name || '';
    return title.toLowerCase().includes(query.toLowerCase()) || author.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <Users className="h-5 w-5" />
          </span>
          Community
        </h1>
        <p className="mt-2 text-muted-foreground">Join discussions, live classes, and connect with peers.</p>
      </div>

      {/* Trending topics */}
      <Card className="card-premium mb-6">
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Trending topics</p>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((t) => (
              <span key={t} className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
                #{t}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-premium">
            <CardHeader className="flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Discussion feed
              </CardTitle>
              <Button variant="ghost" size="sm">New post</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 border-b border-border pb-3">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative px-3 py-1.5 text-sm font-semibold transition-colors ${
                      tab === t ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t}
                    {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-gradient" />}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : tab === 'Discussions' ? (
                filteredDiscussions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No discussions found. Be the first to start a topic!</div>
                ) : (
                  <div className="space-y-3">
                    {filteredDiscussions.map((d, idx) => {
                      const authorName = d.authorName || d.name || 'Anonymous';
                      const title = d.title || d.topic || 'Untitled Discussion';
                      const replies = d.repliesCount ?? d.replies ?? 0;
                      const likes = d.likesCount ?? d.likes ?? 0;
                      return (
                        <div key={d.id || idx} className="flex items-start gap-4 rounded-2xl border border-border p-4 hover:bg-secondary/40 transition-colors">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={d.authorAvatar || d.avatar} alt={authorName} />
                            <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                              {authorName.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold">{authorName}</p>
                              <span className="text-xs text-muted-foreground">· {d.category || 'General'}</span>
                              {d.isPinned && (
                                <Badge className="bg-primary/10 text-primary border-transparent text-[10px]">
                                  <TrendingUp className="mr-1 h-3 w-3" /> Pinned
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
                            {d.content && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.content}</p>}
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Reply className="h-3.5 w-3.5" /> {replies}</span>
                              <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {likes}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : tab === 'Mentor Posts' ? (
                mentorPostsList.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No mentor posts available.</div>
                ) : (
                  <div className="space-y-3">
                    {mentorPostsList.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-border p-4 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={p.authorAvatar} alt={p.authorName} />
                            <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                              {p.authorName.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{p.authorName}</p>
                            <p className="text-xs text-muted-foreground">Mentor</p>
                          </div>
                          <Badge variant="secondary" className="ml-auto">Mentor</Badge>
                        </div>
                        <p className="mt-3 font-semibold text-foreground">{p.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.content}</p>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                questionsList.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No unanswered questions.</div>
                ) : (
                  <div className="space-y-3">
                    {questionsList.map((q) => (
                      <div key={q.id} className="rounded-2xl border border-border p-4 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={q.authorAvatar} alt={q.authorName} />
                            <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                              {q.authorName.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{q.authorName}</p>
                            <p className="text-xs text-muted-foreground">{q.courseTitle}</p>
                          </div>
                          <Badge variant="outline" className="ml-auto flex items-center gap-1 text-[10px]">
                            <HelpCircle className="h-3 w-3" /> Question
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm text-foreground">{q.question}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Live classes */}
          <Card className="card-premium">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" /> Upcoming live classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : liveClassesList.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No upcoming live classes scheduled.</div>
              ) : (
                liveClassesList.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-semibold">{c.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Instructor: {c.instructor}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.scheduledAt} · {c.durationMinutes} mins</p>
                    <Button size="sm" variant="outline" className="mt-3 w-full font-semibold" onClick={() => toast.success(`Reminder set for ${c.title}`)}>Set reminder</Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
