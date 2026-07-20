'use client';

import { Activity, ArrowUpRight, ArrowDownLeft, ShieldCheck, Wallet, Users, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getIcon } from '@/lib/icons';
import {
  adminStats,
  adminActivity,
  adminUsers,
  adminRevenueSeries,
  adminPlanDistribution,
  adminRecentPayments,
} from '@/lib/data/admin';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

const weeklyActivity = [
  { day: 'Mon', users: 420 },
  { day: 'Tue', users: 510 },
  { day: 'Wed', users: 480 },
  { day: 'Thu', users: 620 },
  { day: 'Fri', users: 740 },
  { day: 'Sat', users: 530 },
  { day: 'Sun', users: 410 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Admin overview</h1>
            <p className="text-sm text-muted-foreground">Platform metrics, activity and growth at a glance.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export report</Button>
          <Button size="sm" className="bg-brand-gradient font-semibold">View analytics</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {adminStats.map((s) => {
          const Icon = getIcon(s.icon);
          const isRevenue = s.label.includes('Revenue');
          return (
            <Card key={s.label} className="card-premium">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                      s.trend === 'up' ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {s.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                  </span>
                </div>
                <p className="mt-4 font-display text-2xl font-bold tracking-tight">
                  {isRevenue ? `₹${formatINR(s.value)}` : `${formatINR(s.value)}${s.suffix}`}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-xs text-muted-foreground/80">{s.delta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="card-premium lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Revenue & user growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adminRevenueSeries} margin={{ left: -12, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) =>
                      name === 'revenue' ? [`₹${formatINR(value)}`, 'Revenue'] : [formatINR(value), 'Users']
                    }
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#userGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg">Plan distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={adminPlanDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {adminPlanDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 - weekly activity */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Weekly active users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity} margin={{ left: -12, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="users" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent users + Recent payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Recent signups
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <a href="/admin/users">View all</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Plan</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.slice(0, 5).map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={u.avatar} alt={u.name} />
                            <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                              {u.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.plan === 'Lifetime' ? 'default' : 'secondary'}>{u.plan}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            u.status === 'Active' ? 'text-success' : u.status === 'Trial' ? 'text-warning' : 'text-destructive'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.status === 'Active' ? 'bg-success' : u.status === 'Trial' ? 'bg-warning' : 'bg-destructive'
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{u.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Recent payments
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <a href="/admin/wallet">View all</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Plan</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminRecentPayments.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={p.avatar} alt={p.user} />
                            <AvatarFallback className="bg-brand-gradient text-white text-xs font-semibold">
                              {p.user.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{p.user}</p>
                            <p className="text-xs text-muted-foreground">{p.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{p.plan}</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-success">{p.amount}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={p.status === 'Completed' ? 'default' : p.status === 'Pending' ? 'secondary' : 'destructive'}
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {adminActivity.map((line) => {
              const Icon = getIcon(line.icon);
              return (
                <div key={line.text} className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary ${line.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-foreground">{line.text}</p>
                    <p className="text-xs text-muted-foreground">{line.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
