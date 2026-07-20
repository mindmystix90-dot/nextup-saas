'use client';

import {
  Laptop,
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  PlayCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export function HeroIllustration() {
  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-brand-gradient opacity-20 blur-[80px] rounded-full" />
      <div className="absolute top-10 right-10 h-40 w-40 rounded-full bg-accent/30 blur-[60px]" />

      {/* Main dashboard card */}
      <div className="absolute inset-x-4 top-8 bottom-4 rounded-3xl glass shadow-premium-lg p-5 animate-fade-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">nextup.app</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient">
            <Laptop className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Learning Dashboard</p>
            <p className="text-[11px] text-muted-foreground">Welcome back, Aarav</p>
          </div>
        </div>

        {/* Progress bars */}
        <div className="mt-4 space-y-3">
          {[
            { label: 'Digital Marketing', pct: 78, color: 'from-primary to-accent' },
            { label: 'AI Tools Mastery', pct: 64, color: 'from-blue-500 to-cyan-400' },
            { label: 'Content Creation', pct: 92, color: 'from-emerald-500 to-teal-400' },
          ].map((row, i) => (
            <div key={row.label} className="animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="text-muted-foreground">{row.pct}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${row.color}`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mini stat row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: PlayCircle, label: '12 Lessons' },
            { icon: CheckCircle2, label: '3 Done' },
            { icon: TrendingUp, label: '+24%' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-secondary/60 p-2.5 text-center">
              <s.icon className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-[10px] font-medium text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating: Graduation cap */}
      <div className="absolute -top-2 -left-2 animate-float">
        <div className="glass rounded-2xl shadow-premium-lg p-3.5">
          <GraduationCap className="h-7 w-7 text-primary" />
        </div>
      </div>

      {/* Floating: Certificate */}
      <div className="absolute top-1/3 -right-3 animate-float-slow">
        <div className="glass rounded-2xl shadow-premium-lg p-3.5">
          <Award className="h-7 w-7 text-accent" />
        </div>
      </div>

      {/* Floating: Books */}
      <div className="absolute -bottom-2 left-6 animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="glass rounded-2xl shadow-premium-lg p-3.5">
          <BookOpen className="h-7 w-7 text-emerald-500" />
        </div>
      </div>

      {/* Floating: Progress circle */}
      <div className="absolute bottom-10 -right-1 animate-float-slow" style={{ animationDelay: '0.8s' }}>
        <div className="glass rounded-2xl shadow-premium-lg p-3">
          <div className="relative h-12 w-12">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="125.6"
                strokeDashoffset="31.4"
              />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
              75%
            </span>
          </div>
        </div>
      </div>

      {/* Floating: Sparkles */}
      <div className="absolute top-6 right-1/3 animate-float" style={{ animationDelay: '2s' }}>
        <div className="glass rounded-xl shadow-premium p-2.5">
          <Sparkles className="h-5 w-5 text-amber-400" />
        </div>
      </div>
    </div>
  );
}
