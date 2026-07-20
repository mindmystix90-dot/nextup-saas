'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, MessageSquare, Video, Sparkles, TrendingUp, Users, HelpCircle, Search, ThumbsUp, Reply } from 'lucide-react';
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
import {
  communityDiscussions,
  communityLiveClasses,
  trendingTopics,
  mentorPosts,
  studentQuestions,
} from '@/lib/data/community';
import { announcements } from '@/lib/data/dashboard';
import { getIcon } from '@/lib/icons';

const TABS = ['Discussions', 'Mentor Posts', 'Student Questions'] as const;
type Tab = (typeof TABS)[number];

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>('Discussions');
  const [query, setQuery] = useState('');

  const filteredDiscussions = communityDiscussions.filter(
    (d) =>
      d.topic.toLowerCase().includes(query.toLowerCase()) ||
      d.name.toLowerCase().includes(query.toLowerCase())
  );

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

                {tab === 'Discussions' && (
                  <div className="space-y-3">
                    {filteredDiscussions.map((d) => (
                      <div key={d.topic} className="flex items-start gap-4 rounded-2xl border border-border p-4 hover:bg-secondary/40 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={d.avatar} alt={d.name} />
                          <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                            {d.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{d.name}</p>
                            <span className="text-xs text-muted-foreground">· {d.role}</span>
                            {d.trending && (
                              <Badge className="bg-primary/10 text-primary border-transparent text-[10px]">
                                <TrendingUp className="mr-1 h-3 w-3" /> Trending
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-foreground">{d.topic}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Reply className="h-3.5 w-3.5" /> {d.replies}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {d.likes}</span>
                            <span>{d.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'Mentor Posts' && (
                  <div className="space-y-3">
                    {mentorPosts.map((p) => (
                      <div key={p.title} className="rounded-2xl border border-border p-4 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={p.avatar} alt={p.name} />
                            <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                              {p.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.role} · {p.time}</p>
                          </div>
                          <Badge variant="secondary" className="ml-auto">Mentor</Badge>
                        </div>
                        <p className="mt-3 font-semibold text-foreground">{p.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.excerpt}</p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {p.likes}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'Student Questions' && (
                  <div className="space-y-3">
                    {studentQuestions.map((q) => (
                      <div key={q.question} className="rounded-2xl border border-border p-4 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={q.avatar} alt={q.name} />
                            <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                              {q.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{q.name}</p>
                            <p className="text-xs text-muted-foreground">in {q.course} · {q.time}</p>
                          </div>
                          <Badge variant="outline" className="ml-auto flex items-center gap-1 text-[10px]">
                            <HelpCircle className="h-3 w-3" /> Question
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm text-foreground">{q.question}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Reply className="h-3.5 w-3.5" /> {q.replies} answers</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                {communityLiveClasses.map((c) => (
                  <div key={c.title} className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-semibold">{c.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={c.hostAvatar} alt={c.host} />
                        <AvatarFallback className="bg-brand-gradient text-white text-[10px] font-semibold">
                          {c.host.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground">{c.host}</p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{c.date} · {c.time}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.watching}</p>
                    <Button size="sm" variant="outline" className="mt-3 w-full font-semibold">Set reminder</Button>
                  </div>
                ))}
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
