'use client';

import { Users, Video, MessageCircle, Heart, Sparkles, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function CommunityIllustration() {
  return (
    <div className="relative w-full max-w-[520px] mx-auto">
      <div className="absolute inset-0 bg-brand-gradient opacity-15 blur-[70px] rounded-full" />

      {/* Main card: live class */}
      <div className="relative rounded-3xl glass shadow-premium-lg p-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-pulse-ring" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">Live Now</span>
          </div>
          <span className="text-xs text-muted-foreground">1,284 watching</span>
        </div>

        <div className="mt-4 aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/40 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)]" />
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient shadow-glow">
            <Video className="h-7 w-7 text-white" />
          </span>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex -space-x-2">
              {['AS', 'PV', 'AS', 'NG'].map((i) => (
                <Avatar key={i} className="h-7 w-7 border-2 border-white">
                  <AvatarFallback className="text-[10px] font-semibold bg-brand-gradient text-white">{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-[10px] font-medium text-white">
              Weekly Masterclass
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Friday, 7:00 PM · Scaling with AI</span>
        </div>
      </div>

      {/* Floating: Networking */}
      <div className="absolute -top-4 -right-2 animate-float">
        <div className="glass rounded-2xl shadow-premium-lg p-3.5 w-44">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">Networking</p>
              <p className="text-[10px] text-muted-foreground">2,400+ members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: Support */}
      <div className="absolute -bottom-5 -left-3 animate-float-slow">
        <div className="glass rounded-2xl shadow-premium-lg p-3.5 w-44">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">Student Support</p>
              <p className="text-[10px] text-muted-foreground">Reply in &lt; 2h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: Sparkle */}
      <div className="absolute top-1/2 -left-4 animate-float" style={{ animationDelay: '1s' }}>
        <div className="glass rounded-xl shadow-premium p-2.5">
          <Heart className="h-5 w-5 text-rose-400" />
        </div>
      </div>
      <div className="absolute top-8 right-1/4 animate-float-slow" style={{ animationDelay: '1.8s' }}>
        <div className="glass rounded-xl shadow-premium p-2.5">
          <Sparkles className="h-5 w-5 text-amber-400" />
        </div>
      </div>
    </div>
  );
}
