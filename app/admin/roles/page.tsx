'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Check, Save, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { toast } from 'sonner';
import { fetchRolePermissions, updateRolePermissions } from '@/services/roles.service';
import type { RolePermission } from '@/types';

const ALL_PERMISSIONS = [
  { group: 'User Management', items: ['users.read', 'users.write', 'users.delete'] },
  { group: 'Courses & Live Classes', items: ['courses.read', 'courses.write', 'courses.delete', 'live_classes.read', 'live_classes.write'] },
  { group: 'Monetization & Pricing', items: ['pricing.read', 'pricing.write', 'wallet.read', 'wallet.withdraw', 'affiliate.read', 'affiliate.write'] },
  { group: 'Community & Content', items: ['community.read', 'community.post', 'community.write', 'cms.read', 'cms.write', 'certificates.read'] },
  { group: 'System & Reports', items: ['reports.read', 'support.read', 'support.write', 'settings.read', 'settings.write'] },
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<RolePermission | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRolePermissions();
        setRoles(data);
        if (data.length > 0) {
          setActiveRole(data[0]);
          setSelectedPerms(data[0].permissions || []);
        }
      } catch {
        toast.error('Failed to load role permissions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleSelectRole(r: RolePermission) {
    setActiveRole(r);
    setSelectedPerms(r.permissions || []);
  }

  function togglePermission(perm: string) {
    if (selectedPerms.includes(perm)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== perm));
    } else {
      setSelectedPerms([...selectedPerms, perm]);
    }
  }

  async function saveMatrix() {
    if (!activeRole) return;
    setSaving(true);
    try {
      await updateRolePermissions(activeRole.id, selectedPerms);
      setRoles((prev) =>
        prev.map((r) => (r.id === activeRole.id ? { ...r, permissions: selectedPerms } : r))
      );
      toast.success(`Updated permission matrix for ${activeRole.displayName}`);
    } catch {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ShieldCheck}
        title="Role Management & Permission Engine"
        subtitle="Define RBAC access controls and module permissions for all user roles."
        actions={
          <Button onClick={saveMatrix} disabled={saving || !activeRole} className="bg-brand-gradient font-semibold">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Permissions
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles list */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg">System Roles</CardTitle>
            <CardDescription>Select a role to inspect and configure permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              roles.map((r) => {
                const isActive = activeRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRole(r)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{r.displayName}</p>
                      <Badge variant={r.role === 'superadmin' ? 'default' : 'secondary'}>
                        {r.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{r.permissions.length} active permissions</span>
                      {r.userCount !== undefined && <span>{r.userCount.toLocaleString()} users</span>}
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Permission matrix editor */}
        <Card className="card-premium lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> {activeRole?.displayName || 'Role'} Permissions
                </CardTitle>
                <CardDescription>{activeRole?.description}</CardDescription>
              </div>
              {activeRole?.role === 'superadmin' && (
                <Badge variant="outline" className="border-amber-500 text-amber-500 gap-1">
                  <Info className="h-3 w-3" /> System Restricted
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !activeRole ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldCheck className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p>Select a role from the left list</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ALL_PERMISSIONS.map((group) => (
                  <div key={group.group} className="border border-border rounded-xl p-4 bg-secondary/20">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      {group.group}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.items.map((perm) => {
                        const isChecked = selectedPerms.includes(perm);
                        return (
                          <label
                            key={perm}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                              isChecked ? 'bg-primary/5 border-primary/30' : 'bg-background border-border'
                            }`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => togglePermission(perm)}
                              disabled={activeRole.role === 'superadmin' && perm === 'users.write'}
                            />
                            <span className="text-xs font-mono text-foreground">{perm}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
