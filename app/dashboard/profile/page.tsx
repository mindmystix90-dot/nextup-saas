'use client';

import { useEffect, useState } from 'react';
import { UserCircle, Camera, Save, Lock, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    const source = profile || user;
    if (source) {
      setName(source.name || '');
      setEmail(source.email || '');
      setPhone(source.phone || '');
      setAddress(source.address || '');
      setAvatar(source.photoURL || '');
    }
  }, [user, profile]);

  async function handleSaveProfile() {
    setSaving(true);
    const res = await updateProfile({ name, phone, address, photoURL: avatar });
    setSaving(false);
    if (res.ok) toast.success('Profile updated successfully.');
    else toast.error(res.error || 'Could not update profile.');
  }

  async function handleChangePassword() {
    setChangingPw(true);
    const res = await changePassword(currentPassword, newPassword);
    setChangingPw(false);
    if (res.ok) {
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      toast.error(res.error || 'Could not change password.');
    }
  }

  const initials = (name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <UserCircle className="h-5 w-5" />
          </span>
          Profile
        </h1>
        <p className="mt-2 text-muted-foreground">Manage your account, preferences, and security.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <Card className="card-premium">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-premium">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="bg-brand-gradient text-white text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:scale-105 transition-transform"
                aria-label="Change photo"
                onClick={() => toast.message('Photo upload is a demo feature.')}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 font-display text-lg font-semibold">{name || 'NextUp Learner'}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <span className="mt-3 inline-flex items-center rounded-full bg-brand-gradient-soft px-3 py-1 text-xs font-semibold text-primary">Pro Member</span>
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card className="card-premium lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Personal information</CardTitle>
            <CardDescription>Update your details. Changes are saved to your browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled className="opacity-60 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email cannot be changed in the demo.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Photo URL</Label>
                <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, State, India" />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="bg-brand-gradient font-semibold">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Password */}
        <Card className="card-premium lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Change Password
            </CardTitle>
            <CardDescription>Keep your account secure with a strong password.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={handleChangePassword} disabled={changingPw} variant="outline" className="font-semibold">
                {changingPw ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
