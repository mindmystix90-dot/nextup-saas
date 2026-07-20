'use client';

import { useState } from 'react';
import { MessageSquare, Video, Sparkles, TrendingUp, Users, HelpCircle, Search, ThumbsUp, Reply } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { announcements, liveClasses } from '@/lib/data/dashboard';
import {
  communityDiscussions,
  mentorPosts,
  studentQuestions,
  trendingTopics,
} from '@/lib/data/community';

const TABS = ['Discussions', 'Mentor Posts', 'Questions'] as const;
type Tab = (typeof TABS)[number];

export default function DashboardCommunityPage() {
  const [tab, setTab] = useState<Tab>('Discussions');
  const [query, setQuery] = useState('');

  const filteredDiscussions = communityDiscussions.filter(
    (d) =>
      d.topic.toLowerCase().includes(query.toLowerCase()) ||
      d.name.toLowerCase().includes(query.toLowerCase())
  );

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

              {tab === 'Questions' && (
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
              {liveClasses.map((c) => (
                <div key={c.title} className="rounded-2xl border border-border p-4">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Hosted by {c.host}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.date} · {c.time}</p>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
