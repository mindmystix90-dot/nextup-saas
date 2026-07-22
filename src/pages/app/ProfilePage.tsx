import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User, Save, Mail, Phone, MapPin, Image, Crown, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, Spinner, Button, Input, Avatar } from '@/components/ui';
import { formatDate, initials } from '@/lib/utils';
import { adminUpdateProfile } from '@/services/admin.service';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
      setAddress(profile.address ?? '');
      setPhotoUrl(profile.photo_url ?? '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const res = await adminUpdateProfile(user.id, { name, phone, address, photo_url: photoUrl });
    setSaving(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success('Profile updated!');
    refreshProfile();
  };

  if (!profile) return <Spinner />;

  const membershipLabel = profile.membership?.charAt(0).toUpperCase() + profile.membership?.slice(1);
  const accountLabel = profile.account_type === 'workplace' ? 'Workplace' : 'Learning';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information.</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <Avatar name={profile.name} src={photoUrl || profile.photo_url} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold font-display">{profile.name}</h2>
              <Badge variant={profile.membership === 'lifetime' ? 'success' : profile.membership === 'pro' ? 'warning' : 'secondary'}>
                <Crown className="h-3 w-3 inline mr-1" />{membershipLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline"><Shield className="h-3 w-3 inline mr-1" />{profile.role}</Badge>
              <Badge variant="secondary">{accountLabel} Account</Badge>
              {profile.membership_status === 'active' && <Badge variant="success">Active</Badge>}
            </div>
            {profile.membership_expiry && (
              <p className="text-xs text-muted-foreground mt-2">
                Membership expires: {formatDate(profile.membership_expiry)}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold font-display mb-4">Edit Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Full Name" value={name} onChange={setName} placeholder="Your name" required />
          <Input label="Phone" type="tel" value={phone} onChange={setPhone} placeholder="Phone number" />
          <Input label="Address" value={address} onChange={setAddress} placeholder="Your address" />
          <Input label="Photo URL" value={photoUrl} onChange={setPhotoUrl} placeholder="https://..." />
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold font-display mb-4">Account Details</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Phone:</span>
            <span>{profile.phone || '—'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Address:</span>
            <span>{profile.address || '—'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Member since:</span>
            <span>{formatDate(profile.created_at)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
