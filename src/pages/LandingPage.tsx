import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, Users, TrendingUp, Shield, Award, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-xl font-bold font-display">NextUp</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-sm font-medium hover:text-brand-600">Pricing</Link>
            <Link to="/contact" className="text-sm font-medium hover:text-brand-600">Contact</Link>
            <Link to="/login" className="text-sm font-medium hover:text-brand-600">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get started</Link>
          </div>
          <Link to="/register" className="btn-primary text-sm md:hidden">Start</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4" /> Learn, Earn & Grow
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight mb-6">
              The complete platform for <span className="text-brand-600">learning and earning</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Master new skills with expert-led courses, earn through affiliate marketing and sales partnerships, and build your career — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn-primary text-base px-6 py-3 flex items-center gap-2">
                Start free today <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/pricing" className="btn-outline text-base px-6 py-3">View pricing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Paths */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold font-display text-center mb-4">Choose your path</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Two powerful ways to use NextUp — or use both</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="card p-8 hover:shadow-lg transition-shadow">
            <div className="p-3 rounded-xl bg-brand-100 w-fit mb-4">
              <GraduationCap className="h-7 w-7 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold font-display mb-2">Learning</h3>
            <p className="text-muted-foreground mb-4">Access expert-led courses, track your progress, earn certificates, and join a community of learners.</p>
            <ul className="space-y-2 text-sm">
              {['Course library with lessons', 'Progress tracking', 'Completion certificates', 'Community discussions'].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {f}</li>
              ))}
            </ul>
          </div>
          <div className="card p-8 hover:shadow-lg transition-shadow">
            <div className="p-3 rounded-xl bg-brand-100 w-fit mb-4">
              <Briefcase className="h-7 w-7 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold font-display mb-2">Workplace</h3>
            <p className="text-muted-foreground mb-4">Earn through affiliate referrals or become a Sales Partner with leads, CRM, and weekly commissions.</p>
            <ul className="space-y-2 text-sm">
              {['Affiliate referral links', 'Sales Partner CRM', 'Weekly commission payouts', 'Wallet & withdrawals'].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold font-display text-center mb-12">Everything you need</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: GraduationCap, title: 'Learning LMS', desc: 'Video lessons, PDFs, progress tracking, certificates' },
              { icon: Users, title: 'Affiliate System', desc: 'Referral links, commission tracking, sponsor hierarchy' },
              { icon: TrendingUp, title: 'Sales Partner', desc: 'Lead CRM, calling training, weekly commission' },
              { icon: Shield, title: 'Secure Wallet', desc: 'KYC verification, withdrawals, transaction history' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="p-2.5 rounded-lg bg-brand-100 w-fit mb-4">
                  <f.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="rounded-2xl bg-brand-600 p-12 text-center text-white">
          <Award className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold font-display mb-3">Ready to get started?</h2>
          <p className="text-brand-100 mb-6 max-w-xl mx-auto">Join NextUp today and start your journey toward learning and earning.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors">
            Create your free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold font-display">NextUp</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} NextUp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
