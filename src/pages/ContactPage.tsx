import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { submitContact } from '@/services/general.service';
import { Input, Textarea } from '@/components/ui';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await submitContact({ name, email, subject, message });
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success('Message sent! We\'ll get back to you soon.');
    setName(''); setEmail(''); setSubject(''); setMessage('');
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center"><span className="text-white font-bold">N</span></div>
            <span className="text-xl font-bold font-display">NextUp</span>
          </Link>
          <Link to="/register" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold font-display text-center mb-3">Get in touch</h1>
        <p className="text-center text-muted-foreground mb-12">Have questions? We're here to help.</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-brand-100"><Mail className="h-5 w-5 text-brand-600" /></div>
              <div><p className="font-semibold">Email</p><p className="text-sm text-muted-foreground">support@nextup.com</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-brand-100"><Phone className="h-5 w-5 text-brand-600" /></div>
              <div><p className="font-semibold">Phone</p><p className="text-sm text-muted-foreground">+91 98765 43210</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-brand-100"><MapPin className="h-5 w-5 text-brand-600" /></div>
              <div><p className="font-semibold">Address</p><p className="text-sm text-muted-foreground">Bengaluru, Karnataka, India</p></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <Input label="Name" value={name} onChange={setName} required placeholder="Your name" />
            <Input label="Email" type="email" value={email} onChange={setEmail} required placeholder="you@example.com" />
            <Input label="Subject" value={subject} onChange={setSubject} placeholder="How can we help?" />
            <Textarea label="Message" value={message} onChange={setMessage} placeholder="Your message..." />
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
