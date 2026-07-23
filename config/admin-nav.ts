export type AdminNavGroup = 'Overview' | 'Manage' | 'Engage' | 'Revenue' | 'Insights' | 'Operations';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  group: AdminNavGroup;
}

export const adminNavGroups: AdminNavGroup[] = ['Overview', 'Manage', 'Engage', 'Revenue', 'Insights', 'Operations'];

export const adminNav: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', group: 'Overview' },
  { label: 'Search', href: '/admin/search', icon: 'Search', group: 'Overview' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3', group: 'Overview' },
  { label: 'Reports', href: '/admin/reports', icon: 'FileText', group: 'Overview' },
  { label: 'Users', href: '/admin/users', icon: 'Users', group: 'Manage' },
  { label: 'Packages', href: '/admin/packages', icon: 'CreditCard', group: 'Manage' },
  { label: 'Courses', href: '/admin/courses', icon: 'BookOpen', group: 'Manage' },
  { label: 'Community', href: '/admin/community', icon: 'Users', group: 'Engage' },
  { label: 'Live Classes', href: '/admin/live-classes', icon: 'Video', group: 'Engage' },
  { label: 'Notifications', href: '/admin/notifications', icon: 'Bell', group: 'Engage' },
  { label: 'Affiliate', href: '/admin/affiliate', icon: 'Network', group: 'Revenue' },
  { label: 'Sales Partners', href: '/admin/sales-partners', icon: 'Handshake', group: 'Revenue' },
  { label: 'Payments', href: '/admin/payments', icon: 'Wallet', group: 'Revenue' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'BadgePercent', group: 'Revenue' },
  { label: 'CMS', href: '/admin/cms', icon: 'FileText', group: 'Insights' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings', group: 'Operations' },
  { label: 'Support', href: '/admin/support', icon: 'LifeBuoy', group: 'Operations' },
];
