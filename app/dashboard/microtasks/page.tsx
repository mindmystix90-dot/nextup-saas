'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  CheckSquare,
  Clock,
  Sparkles,
  ExternalLink,
  Zap,
  DollarSign,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Building2,
  Image as ImageIcon,
  Link2,
  Type,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';
import {
  fetchTasks,
  fetchProviders,
  fetchSubmissionsForUser,
} from '@/services/microtasks.service';
import { formatINR } from '@/services/wallet.service';
import type { Microtask, MicrotaskProvider, MicrotaskSubmission } from '@/types';

export default function MicrotasksDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Microtask[]>([]);
  const [providers, setProviders] = useState<MicrotaskProvider[]>([]);
  const [submissions, setSubmissions] = useState<MicrotaskSubmission[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('reward_desc');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [tList, pList] = await Promise.all([
          fetchTasks(),
          fetchProviders(),
        ]);
        setTasks(tList);
        setProviders(pList);

        if (user?.uid) {
          const uSubs = await fetchSubmissionsForUser(user.uid);
          setSubmissions(uSubs);
        }
      } catch (err) {
        console.error('Failed loading microtasks:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  // Calculations
  const approvedSubs = submissions.filter((s) => s.status === 'approved');
  const totalEarned = approvedSubs.reduce((acc, s) => acc + s.reward, 0);
  const pendingCount = submissions.filter((s) => s.status === 'submitted' || s.status === 'pending_provider').length;

  // Filtering Logic
  const filteredTasks = tasks.filter((task) => {
    if (task.status !== 'active') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchCategory = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCategory) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }

    // Provider filter
    if (selectedProvider !== 'all' && task.providerId !== selectedProvider) {
      return false;
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all' && task.difficulty !== selectedDifficulty) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (selectedSort === 'reward_desc') return b.reward - a.reward;
    if (selectedSort === 'reward_asc') return a.reward - b.reward;
    if (selectedSort === 'time_asc') return a.estimatedMinutes - b.estimatedMinutes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Easy</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Medium</Badge>;
      case 'hard':
        return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">Hard</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const getProofIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <span key={type} title="Text Proof"><Type className="h-3.5 w-3.5 text-blue-500" /></span>;
      case 'url':
        return <span key={type} title="URL Link Proof"><Link2 className="h-3.5 w-3.5 text-purple-500" /></span>;
      case 'screenshot':
        return <span key={type} title="Screenshot Proof"><ImageIcon className="h-3.5 w-3.5 text-emerald-500" /></span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-[90px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md mb-3 border border-white/10">
                <Zap className="h-3.5 w-3.5 text-emerald-400" /> Instant Wallet Payouts Verified
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Microtask & Offer Marketplace</h1>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                Complete quick social tasks, surveys, and app signups to earn real cash directly credited to your unified NextUp wallet.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild className="bg-brand-gradient font-semibold shadow-glow">
                <Link href="#marketplace">
                  <Sparkles className="mr-2 h-4 w-4" /> Explore Offers
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Available Tasks</p>
                <h3 className="text-2xl font-bold tracking-tight mt-1">{filteredTasks.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CheckSquare className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Earned</p>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{formatINR(totalEarned)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Pending Proofs</p>
                <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
                  {pendingCount}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tasks Completed</p>
                <h3 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mt-1">
                  {approvedSubs.length}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <FileCheck2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Workspace Tabs */}
        <Tabs defaultValue="marketplace" className="space-y-6" id="marketplace">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 p-1 bg-secondary/50 rounded-xl">
            <TabsTrigger value="marketplace" className="rounded-lg text-xs font-semibold">
              <Zap className="mr-2 h-3.5 w-3.5" /> Task Marketplace
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-xs font-semibold">
              <FileCheck2 className="mr-2 h-3.5 w-3.5" /> Submission History ({submissions.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TASK MARKETPLACE */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Search & Filter Bar */}
            <Card className="p-4 card-premium">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks, keywords, or requirements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Category */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="survey">Surveys</SelectItem>
                      <SelectItem value="app_download">App Downloads</SelectItem>
                      <SelectItem value="signup">Signups</SelectItem>
                      <SelectItem value="review">Reviews</SelectItem>
                      <SelectItem value="video">Video Watching</SelectItem>
                      <SelectItem value="other">Other Offers</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Provider */}
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Difficulty */}
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sorting */}
                  <Select value={selectedSort} onValueChange={setSelectedSort}>
                    <SelectTrigger className="bg-background text-xs">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reward_desc">Highest Reward</SelectItem>
                      <SelectItem value="reward_asc">Lowest Reward</SelectItem>
                      <SelectItem value="time_asc">Fastest Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Task Grid */}
            {filteredTasks.length === 0 ? (
              <Card className="p-12 text-center card-premium">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="font-semibold text-lg">No microtasks match your criteria</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                  Try clearing your search query or filters to discover available offers.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedProvider('all');
                    setSelectedDifficulty('all');
                  }}
                >
                  Reset Filters
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTasks.map((task) => {
                  const hasSubmitted = submissions.some((s) => s.taskId === task.id);
                  const progress = Math.min(100, Math.round((task.completedCount / task.maxSubmissions) * 100));

                  return (
                    <Card key={task.id} className="card-premium flex flex-col justify-between hover:border-primary/40 transition-all duration-200">
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] font-semibold tracking-wider uppercase bg-secondary/40">
                            <Building2 className="mr-1 h-3 w-3 text-primary" /> {task.providerName}
                          </Badge>
                          {getDifficultyBadge(task.difficulty)}
                        </div>

                        <CardTitle className="text-base font-bold line-clamp-2 leading-snug">
                          {task.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs mt-1">
                          {task.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 space-y-4">
                        {/* Reward & Estimate */}
                        <div className="flex items-center justify-between bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">You Receive</p>
                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                              ₹{formatINR(task.reward)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Est. Time</p>
                            <p className="text-xs font-semibold flex items-center justify-end gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-muted-foreground" /> {task.estimatedMinutes} mins
                            </p>
                          </div>
                        </div>

                        {/* Proof Types Required */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                          <span className="text-[11px] font-medium">Proof Required:</span>
                          <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                            {task.proofTypes.map((pt) => getProofIcon(pt))}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Quota Completed</span>
                            <span className="font-semibold">{task.completedCount} / {task.maxSubmissions}</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>

                        {/* Action CTA */}
                        {hasSubmitted ? (
                          <Button variant="secondary" className="w-full text-xs font-semibold cursor-default" disabled>
                            <CheckSquare className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Proof Submitted
                          </Button>
                        ) : (
                          <Button asChild className="w-full bg-brand-gradient text-xs font-semibold shadow-sm">
                            <Link href={`/dashboard/microtasks/${task.id}`}>
                              Start Task & Submit Proof <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: USER SUBMISSION HISTORY */}
          <TabsContent value="history" className="space-y-6">
            <Card className="card-premium p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg">Your Task Submissions</CardTitle>
                <CardDescription>
                  Track approval status, uploaded proofs, and earnings for tasks you have submitted.
                </CardDescription>
              </CardHeader>

              {submissions.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground/40 mb-2" />
                  <p className="font-medium">No tasks submitted yet</p>
                  <p className="text-xs mt-1">Browse the Task Marketplace above to start earning!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl bg-card hover:bg-secondary/30 transition-all gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {sub.providerName}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm">{sub.taskTitle}</h4>
                        {sub.proofText && (
                          <p className="text-xs text-muted-foreground line-clamp-1 italic">
                            Proof Note: &quot;{sub.proofText}&quot;
                          </p>
                        )}
                        {sub.rejectionReason && (
                          <p className="text-xs text-rose-500 font-medium">
                            Rejection Reason: {sub.rejectionReason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-medium">Reward</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">
                            +₹{formatINR(sub.reward)}
                          </p>
                        </div>

                        <div>
                          {sub.status === 'approved' && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                              Approved & Paid
                            </Badge>
                          )}
                          {sub.status === 'rejected' && (
                            <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                              Rejected
                            </Badge>
                          )}
                          {(sub.status === 'submitted' || sub.status === 'pending_provider') && (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                              In Review
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
