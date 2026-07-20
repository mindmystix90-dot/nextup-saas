export const helpArticles: {
  icon: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
}[] = [
  {
    icon: 'BookOpen',
    title: 'Getting started with your first course',
    excerpt: 'Learn how to enroll, navigate lessons, and track your progress.',
    category: 'Getting Started',
    readTime: '3 min read',
  },
  {
    icon: 'Award',
    title: 'How certificates work and how to verify them',
    excerpt: 'Everything about earning, downloading, and sharing your certificates.',
    category: 'Certificates',
    readTime: '4 min read',
  },
  {
    icon: 'Wallet',
    title: 'Managing your wallet and payouts',
    excerpt: 'Understand balances, transactions, and how to withdraw your earnings.',
    category: 'Wallet',
    readTime: '5 min read',
  },
  {
    icon: 'Users',
    title: 'Joining live classes and discussions',
    excerpt: 'Make the most of the community with live sessions and peer support.',
    category: 'Community',
    readTime: '3 min read',
  },
  {
    icon: 'ShieldCheck',
    title: 'Keeping your account secure',
    excerpt: 'Best practices for passwords, sessions, and account privacy.',
    category: 'Account',
    readTime: '4 min read',
  },
  {
    icon: 'Gift',
    title: 'Earning with the affiliate program',
    excerpt: 'How referrals work, payout rules, and how to track your earnings.',
    category: 'Affiliate',
    readTime: '6 min read',
  },
];

export const supportTickets: {
  id: string;
  subject: string;
  status: 'Open' | 'Awaiting Reply' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  updated: string;
}[] = [
  { id: 'TKT-2041', subject: 'Cannot download my Digital Marketing certificate', status: 'Open', priority: 'High', updated: '2h ago' },
  { id: 'TKT-2038', subject: 'Question about Pro plan billing', status: 'Awaiting Reply', priority: 'Medium', updated: '1d ago' },
  { id: 'TKT-2019', subject: 'How to update my profile photo?', status: 'Resolved', priority: 'Low', updated: '3d ago' },
];

export const supportChannels: { icon: string; title: string; text: string; href: string }[] = [
  { icon: 'BookOpen', title: 'Help Center', text: 'Browse guides and articles', href: '#' },
  { icon: 'MessageSquare', title: 'Live Chat', text: 'Mon–Fri, 9am–6pm IST', href: '#' },
  { icon: 'Mail', title: 'Email Us', text: 'hello@nextup.com', href: '/contact' },
];
