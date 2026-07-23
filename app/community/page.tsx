'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, MessageSquare, Video, Sparkles, TrendingUp, Users, HelpCircle, Search, ThumbsUp, Reply, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Reveal } from '@/components/site/reveal';
import { SectionHeading } from '@/components/site/section-heading';
import { CommunityIllustration } from '@/components/site/community-illustration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { communityFeatures } from '@/lib/data/site';
import { fetchDiscussions, fetchMentorPosts, fetchStudentQuestions } from '@/services/community.service';
import { fetchLiveClasses } from '@/services/live-classes.service';
import type { Discussion, MentorPost, StudentQuestion, LiveClassSession } from '@/types';
import { getIcon } from '@/lib/icons';
import { toast } from 'sonner';

const TABS = ['Discussions', 'Mentor Posts', 'Student Questions'] as const;
type Tab = (typeof TABS)[number];

const trendingTopics = ['Next.js', 'Firebase', 'React', 'Fullstack', 'Design Systems'];
const announcements = [
  {
    title: 'Community Guidelines Updated',
    text: 'Please review our updated community guidelines for respectful discussions.',
    tag: 'Announcement',
    tagColor: 'bg-primary/10 text-primary',
  },
];

export default function CommunityPage() {
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
        toast.error('Failed to load community content');
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-brand-gradient opacity-10 blur-[120px]" />
        </div>
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Community
            </span>
            <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              Learn together, <span className="text-gradient">grow faster</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Join 25,000+ learners in a supportive community. Attend live classes, network
              with peers, and get help whenever you need it.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-brand-gradient shadow-glow font-semibold h-12 px-7">
                <Link href="/register">Join the community <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 font-semibold">
                <Link href="/dashboard/community">Go to discussions</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <CommunityIllustration />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="container section-padding">
        <Reveal>
          <SectionHeading
            eyebrow="What you get"
            title={<>Everything you need to <span className="text-gradient">stay motivated</span></>}
          />
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {communityFeatures.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
            <Reveal key={item.title} delay={i * 100}>
              <Card className="card-premium card-premium-hover h-full p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </Card>
            </Reveal>
            );
          })}
        </div>
      </section>

      {/* Trending topics */}
      <section className="container pb-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" /> Trending topics
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">What the community is talking about right now.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((t) => (
                <span key={t} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Feed + sidebar */}
      <section className="container pb-24">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-premium">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
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
                <div className="flex gap-2 border-b border-border pb-4">
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
                    <div className="text-center py-12 text-muted-foreground text-sm">No community discussions found. Be the first to start a conversation!</div>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live classes */}
            <Card className="card-premium">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" /> Live classes
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

            {/* Announcements */}
            <Card className="card-premium">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcements.map((a) => (
                  <div key={a.title} className="rounded-2xl border border-border p-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${a.tagColor}`}>{a.tag}</span>
                    <p className="mt-2 text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{a.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community stats */}
            <Card className="card-premium overflow-hidden">
              <div className="bg-brand-gradient p-5 text-white">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <p className="font-display text-lg font-bold">Community pulse</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-display text-xl font-bold">25K+</p>
                    <p className="text-[11px] text-white/70">Members</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold">1.2K</p>
                    <p className="text-[11px] text-white/70">Online now</p>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold">320</p>
                    <p className="text-[11px] text-white/70">Posts / week</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
