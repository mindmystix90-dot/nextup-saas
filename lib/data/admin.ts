import type { Role } from '@/types';

// Demo data for the Admin Panel. All values are static prototypes — no backend.

export const adminStats: {
  value: number;
  suffix: string;
  label: string;
  icon: string;
  delta: string;
  trend: 'up' | 'down';
}[] = [
  { value: 25042, suffix: '+', label: 'Total Users', icon: 'Users', delta: '+412 this week', trend: 'up' },
  { value: 412, suffix: '', label: 'New Users', icon: 'UserCircle', delta: '+18% WoW', trend: 'up' },
  { value: 4800000, suffix: '', label: 'Revenue', icon: 'IndianRupee', delta: '+8.4% MoM', trend: 'up' },
  { value: 20, suffix: '+', label: 'Courses', icon: 'BookOpen', delta: '+2 this month', trend: 'up' },
  { value: 1284, suffix: '', label: 'Affiliates', icon: 'Network', delta: '+86 this month', trend: 'up' },
  { value: 8420, suffix: '', label: 'Active Students', icon: 'GraduationCap', delta: '+5.2% WoW', trend: 'up' },
];

export const adminRecentPayments: {
  id: string;
  user: string;
  avatar: string;
  plan: string;
  amount: string;
  method: string;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}[] = [
  { id: 'TX-9001', user: 'Aarav Sharma', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', plan: 'Pro', amount: '+₹999', method: 'UPI', status: 'Completed', date: '16 Jul 2026' },
  { id: 'TX-9002', user: 'Priya Verma', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', plan: 'Lifetime', amount: '+₹4,999', method: 'Card', status: 'Completed', date: '15 Jul 2026' },
  { id: 'TX-9003', user: 'Aditya Singh', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', plan: 'Pro', amount: '+₹999', method: 'UPI', status: 'Pending', date: '14 Jul 2026' },
  { id: 'TX-9004', user: 'Neha Gupta', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', plan: 'Course', amount: '+₹2,999', method: 'UPI', status: 'Completed', date: '13 Jul 2026' },
  { id: 'TX-9005', user: 'Ishaan Kapoor', avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', plan: 'Pro', amount: '+₹999', method: 'Card', status: 'Failed', date: '12 Jul 2026' },
];

export const adminActivity: {
  icon: string;
  text: string;
  time: string;
  color: string;
}[] = [
  { icon: 'BookOpen', text: 'New course "AI for Business Growth" published', time: '2h ago', color: 'text-primary' },
  { icon: 'Users', text: '142 new signups in the last 24 hours', time: '5h ago', color: 'text-success' },
  { icon: 'Video', text: 'Weekly live class completed — 1,284 attendees', time: '1d ago', color: 'text-violet-500' },
  { icon: 'Wallet', text: 'Payout of ₹2,10,000 processed to affiliates', time: '2d ago', color: 'text-amber-500' },
  { icon: 'Award', text: '318 certificates issued this week', time: '3d ago', color: 'text-emerald-500' },
];

export const adminUsers: {
  id: string;
  name: string;
  email: string;
  plan: 'Starter' | 'Pro' | 'Lifetime';
  status: 'Active' | 'Trial' | 'Suspended';
  role: Role;
  joined: string;
  avatar: string;
}[] = [
  { id: 'U-1001', name: 'Aarav Sharma', email: 'aarav@example.in', plan: 'Pro', status: 'Active', role: 'student', joined: '12 Jul 2026', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1002', name: 'Priya Verma', email: 'priya@example.in', plan: 'Lifetime', status: 'Active', role: 'instructor', joined: '8 Jul 2026', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1003', name: 'Aditya Singh', email: 'aditya@example.in', plan: 'Pro', status: 'Active', role: 'affiliate', joined: '4 Jul 2026', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1004', name: 'Neha Gupta', email: 'neha@example.in', plan: 'Starter', status: 'Trial', role: 'student', joined: '2 Jul 2026', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1005', name: 'Ishaan Kapoor', email: 'ishaan@example.in', plan: 'Lifetime', status: 'Active', role: 'student', joined: '28 Jun 2026', avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1006', name: 'Sneha Reddy', email: 'sneha@example.in', plan: 'Pro', status: 'Active', role: 'instructor', joined: '24 Jun 2026', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1007', name: 'Karan Malhotra', email: 'karan@example.in', plan: 'Pro', status: 'Suspended', role: 'student', joined: '20 Jun 2026', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1008', name: 'Rohan Mehta', email: 'rohan@example.in', plan: 'Lifetime', status: 'Active', role: 'instructor', joined: '15 Jun 2026', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1009', name: 'Ananya Iyer', email: 'ananya@example.in', plan: 'Lifetime', status: 'Active', role: 'admin', joined: '10 Jun 2026', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1010', name: 'Ishita Banerjee', email: 'ishita@example.in', plan: 'Starter', status: 'Trial', role: 'student', joined: '5 Jun 2026', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1011', name: 'Devansh Patel', email: 'devansh@example.in', plan: 'Pro', status: 'Active', role: 'affiliate', joined: '1 Jun 2026', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1012', name: 'Meera Krishnan', email: 'meera@example.in', plan: 'Pro', status: 'Active', role: 'student', joined: '28 May 2026', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { id: 'U-1013', name: 'NextUp Admin', email: 'admin@nextup.in', plan: 'Lifetime', status: 'Active', role: 'superadmin', joined: '1 Jan 2026', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
];

export const adminCourses: {
  id: string;
  title: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  students: number;
  rating: number;
  price: string;
  status: 'Published' | 'Draft';
  icon: string;
  gradient: string;
}[] = [
  { id: 'C-201', title: 'Digital Marketing Mastery', instructor: 'Ananya Iyer', category: 'Marketing', level: 'Beginner', students: 4200, rating: 4.9, price: '₹2,499', status: 'Published', icon: 'Megaphone', gradient: 'from-blue-500 to-cyan-400' },
  { id: 'C-202', title: 'AI Tools for Work', instructor: 'Rohan Mehta', category: 'AI Tools', level: 'Intermediate', students: 3100, rating: 4.8, price: '₹2,999', status: 'Published', icon: 'Bot', gradient: 'from-violet-500 to-purple-500' },
  { id: 'C-203', title: 'Business Strategy 101', instructor: 'Priya Verma', category: 'Business', level: 'Beginner', students: 2800, rating: 4.7, price: '₹1,999', status: 'Published', icon: 'Briefcase', gradient: 'from-emerald-500 to-teal-400' },
  { id: 'C-204', title: 'Content Creation Bootcamp', instructor: 'Karan Malhotra', category: 'Content', level: 'Intermediate', students: 5100, rating: 4.9, price: '₹3,499', status: 'Published', icon: 'PenTool', gradient: 'from-rose-500 to-pink-500' },
  { id: 'C-205', title: 'Speak with Confidence', instructor: 'Neha Gupta', category: 'Communication', level: 'Beginner', students: 1900, rating: 4.8, price: '₹1,499', status: 'Published', icon: 'MessageSquare', gradient: 'from-amber-500 to-orange-400' },
  { id: 'C-206', title: 'Sales Mastery Pro', instructor: 'Aditya Singh', category: 'Sales', level: 'Advanced', students: 2400, rating: 4.9, price: '₹3,999', status: 'Published', icon: 'ShoppingBag', gradient: 'from-indigo-500 to-blue-500' },
  { id: 'C-207', title: 'Freelance Career Launch', instructor: 'Sneha Reddy', category: 'Freelancing', level: 'Beginner', students: 1500, rating: 4.7, price: '₹1,999', status: 'Published', icon: 'Laptop', gradient: 'from-teal-500 to-emerald-400' },
  { id: 'C-208', title: 'Build Your Personal Brand', instructor: 'Ishaan Kapoor', category: 'Branding', level: 'Intermediate', students: 2100, rating: 4.8, price: '₹2,499', status: 'Published', icon: 'UserCircle', gradient: 'from-fuchsia-500 to-purple-500' },
  { id: 'C-209', title: 'AI for Business Growth', instructor: 'Rohan Mehta', category: 'AI Tools', level: 'Advanced', students: 1800, rating: 4.9, price: '₹4,499', status: 'Published', icon: 'Bot', gradient: 'from-violet-500 to-indigo-500' },
  { id: 'C-210', title: 'Advanced SEO Workshop', instructor: 'Ananya Iyer', category: 'Marketing', level: 'Advanced', students: 0, rating: 0, price: '₹3,999', status: 'Draft', icon: 'Megaphone', gradient: 'from-blue-500 to-indigo-500' },
];

export const adminCertificates: {
  id: string;
  recipientName: string;
  courseName: string;
  instructor: string;
  issueDate: string;
  grade: string;
  status: 'Verified' | 'Pending' | 'Revoked';
  gradient: string;
  icon: string;
}[] = [
  { id: 'NX-2024-08AF31', recipientName: 'Aarav Sharma', courseName: 'Digital Marketing Mastery', instructor: 'Ananya Iyer', issueDate: '15 July 2024', grade: 'A+', status: 'Verified', gradient: 'from-blue-500 to-cyan-400', icon: 'Megaphone' },
  { id: 'NX-2024-19BD52', recipientName: 'Aarav Sharma', courseName: 'AI Tools for Work', instructor: 'Rohan Mehta', issueDate: '2 August 2024', grade: 'A', status: 'Verified', gradient: 'from-violet-500 to-purple-500', icon: 'Bot' },
  { id: 'NX-2024-27CE63', recipientName: 'Aarav Sharma', courseName: 'Content Creation Bootcamp', instructor: 'Karan Malhotra', issueDate: '18 August 2024', grade: 'A+', status: 'Verified', gradient: 'from-emerald-500 to-teal-400', icon: 'PenTool' },
  { id: 'NX-2024-11PV29', recipientName: 'Priya Verma', courseName: 'Content Creation Bootcamp', instructor: 'Karan Malhotra', issueDate: '8 July 2024', grade: 'A', status: 'Verified', gradient: 'from-emerald-500 to-teal-400', icon: 'PenTool' },
  { id: 'NX-2024-23AS14', recipientName: 'Aditya Singh', courseName: 'Sales Mastery Pro', instructor: 'Aditya Singh', issueDate: '19 July 2024', grade: 'A+', status: 'Verified', gradient: 'from-indigo-500 to-blue-500', icon: 'ShoppingBag' },
  { id: 'NX-2024-37NG08', recipientName: 'Neha Gupta', courseName: 'AI for Business Growth', instructor: 'Rohan Mehta', issueDate: '3 August 2024', grade: 'A', status: 'Verified', gradient: 'from-violet-500 to-indigo-500', icon: 'Bot' },
  { id: 'NX-2024-42EG85', recipientName: 'Aarav Sharma', courseName: 'Business Strategy 101', instructor: 'Priya Verma', issueDate: '22 September 2024', grade: 'A+', status: 'Verified', gradient: 'from-indigo-500 to-blue-500', icon: 'Briefcase' },
  { id: 'NX-2024-55IK77', recipientName: 'Ishaan Kapoor', courseName: 'Build Your Personal Brand', instructor: 'Ishaan Kapoor', issueDate: '12 October 2024', grade: 'A', status: 'Pending', gradient: 'from-fuchsia-500 to-purple-500', icon: 'UserCircle' },
  { id: 'NX-2024-61SR88', recipientName: 'Sneha Reddy', courseName: 'Freelance Career Launch', instructor: 'Sneha Reddy', issueDate: '20 October 2024', grade: 'B+', status: 'Revoked', gradient: 'from-teal-500 to-emerald-400', icon: 'Laptop' },
];

export const adminPricingPlans: {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  status: 'Active' | 'Archived';
  featured?: boolean;
  badge?: string;
}[] = [
  {
    id: 'P-01',
    name: 'Starter',
    price: '₹499',
    period: '/month',
    description: 'Perfect to explore the platform and try a few lessons.',
    features: ['Access to 5 starter lessons', 'Community read access', 'Basic progress tracking', 'Email support'],
    status: 'Active',
  },
  {
    id: 'P-02',
    name: 'Pro',
    price: '₹999',
    period: '/month',
    description: 'Everything you need to learn seriously and grow.',
    features: ['All 20+ courses', 'Verifiable certificates', 'Weekly live classes', 'Full community access', 'Priority support', 'Progress analytics'],
    status: 'Active',
    featured: true,
    badge: 'Most Popular',
  },
  {
    id: 'P-03',
    name: 'Lifetime',
    price: '₹4,999',
    period: 'one-time',
    description: 'Pay once. Learn forever. No recurring fees.',
    features: ['Everything in Pro', 'Lifetime access', 'All future courses', 'Exclusive alumni network', 'Early feature access', '1:1 onboarding call'],
    status: 'Active',
  },
  {
    id: 'P-04',
    name: 'Team',
    price: '₹2,499',
    period: '/user/month',
    description: 'For teams and organizations learning together.',
    features: ['Everything in Pro', 'Team analytics', 'Centralized billing', 'Shared learning paths', 'Dedicated manager'],
    status: 'Archived',
  },
];

export const adminTestimonials: {
  id: string;
  name: string;
  role: string;
  rating: number;
  review: string;
  avatar: string;
  status: 'Published' | 'Pending' | 'Hidden';
}[] = [
  { id: 'T-01', name: 'Aarav Sharma', role: 'Digital Marketing Executive', rating: 5, review: 'NextUp completely changed how I approach learning. The courses are practical, the community is supportive, and the certificate helped me land a better role at a top agency.', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop', status: 'Published' },
  { id: 'T-02', name: 'Priya Verma', role: 'Freelance Content Creator', rating: 5, review: 'The content creation track is gold. I went from hobbyist to booking real clients within three months. The live classes keep me accountable and motivated.', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop', status: 'Published' },
  { id: 'T-03', name: 'Aditya Singh', role: 'Startup Founder', rating: 5, review: 'As a founder, I wear many hats. NextUp helped me sharpen sales, marketing, and AI skills in one place. The quality is genuinely premium and worth every rupee.', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop', status: 'Published' },
  { id: 'T-04', name: 'Neha Gupta', role: 'AI Engineer', rating: 5, review: 'The AI Tools courses are surprisingly deep for a general platform. I recommend NextUp to every junior engineer on my team at the office.', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop', status: 'Published' },
  { id: 'T-05', name: 'Ishaan Kapoor', role: 'Content Strategist', rating: 5, review: 'Beautiful platform, beautiful content. The certificate verification actually impressed my employer. Worth every penny spent on the Pro plan.', avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop', status: 'Pending' },
  { id: 'T-06', name: 'Sneha Reddy', role: 'Sales Lead', rating: 4, review: 'The sales and communication tracks are practical, not fluffy. My team\'s close rate went up significantly after we all took the course together.', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop', status: 'Hidden' },
];

export const adminCommunityPosts: {
  id: string;
  author: string;
  avatar: string;
  category: string;
  topic: string;
  replies: number;
  likes: number;
  reports: number;
  status: 'Active' | 'Flagged' | 'Pinned';
  time: string;
}[] = [
  { id: 'P-301', author: 'Aarav Sharma', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', category: 'AI Tools', topic: 'Best AI tools for content repurposing in 2026?', replies: 24, likes: 87, reports: 0, status: 'Active', time: '2h ago' },
  { id: 'P-302', author: 'Karan Malhotra', avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', category: 'Freelancing', topic: 'How I landed my first 3 clients as a freelancer', replies: 58, likes: 142, reports: 0, status: 'Pinned', time: '5h ago' },
  { id: 'P-303', author: 'Priya Verma', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', category: 'Business', topic: 'Hiring tips for early-stage teams in India', replies: 31, likes: 64, reports: 2, status: 'Flagged', time: '1d ago' },
  { id: 'P-304', author: 'Neha Gupta', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', category: 'Communication', topic: 'Tips for presenting technical work to non-technical stakeholders', replies: 19, likes: 52, reports: 0, status: 'Active', time: '1d ago' },
  { id: 'P-305', author: 'Ishaan Kapoor', avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', category: 'Branding', topic: 'Building a personal brand on LinkedIn — week 1 plan', replies: 42, likes: 110, reports: 1, status: 'Flagged', time: '2d ago' },
];

export const adminWalletTransactions: {
  id: string;
  user: string;
  type: 'in' | 'out';
  label: string;
  amount: string;
  date: string;
  method: string;
  status: 'Completed' | 'Pending' | 'Failed';
}[] = [
  { id: 'TX-9001', user: 'Aarav Sharma', type: 'in', label: 'Pro subscription', amount: '+₹999', date: '16 Jul 2026', method: 'UPI', status: 'Completed' },
  { id: 'TX-9002', user: 'Priya Verma', type: 'in', label: 'Lifetime upgrade', amount: '+₹4,999', date: '15 Jul 2026', method: 'Card', status: 'Completed' },
  { id: 'TX-9003', user: 'Aditya Singh', type: 'out', label: 'Affiliate payout', amount: '-₹6,000', date: '14 Jul 2026', method: 'Bank', status: 'Pending' },
  { id: 'TX-9004', user: 'Neha Gupta', type: 'in', label: 'Course purchase', amount: '+₹2,999', date: '13 Jul 2026', method: 'UPI', status: 'Completed' },
  { id: 'TX-9005', user: 'Ishaan Kapoor', type: 'out', label: 'Refund — duplicate charge', amount: '-₹2,499', date: '12 Jul 2026', method: 'Card', status: 'Failed' },
  { id: 'TX-9006', user: 'Sneha Reddy', type: 'in', label: 'Pro subscription', amount: '+₹999', date: '11 Jul 2026', method: 'UPI', status: 'Completed' },
  { id: 'TX-9007', user: 'Karan Malhotra', type: 'out', label: 'Withdrawal request', amount: '-₹2,500', date: '10 Jul 2026', method: 'Bank', status: 'Pending' },
];

export const adminAffiliateStats: {
  value: string;
  label: string;
  icon: string;
  delta: string;
}[] = [
  { value: '1,284', label: 'Active affiliates', icon: 'Users', delta: '+86 this month' },
  { value: '₹4,80,000', label: 'Total payouts', icon: 'Wallet', delta: '+₹42,000 this month' },
  { value: '3,920', label: 'Referral signups', icon: 'TrendingUp', delta: '+312 this month' },
  { value: '67%', label: 'Conversion rate', icon: 'Sparkles', delta: '+4.1% MoM' },
];

export const adminAffiliates: {
  id: string;
  name: string;
  email: string;
  referrals: number;
  joined: number;
  earned: string;
  status: 'Active' | 'Paused' | 'Banned';
}[] = [
  { id: 'A-501', name: 'Aarav Sharma', email: 'aarav@example.in', referrals: 42, joined: 28, earned: '₹12,400', status: 'Active' },
  { id: 'A-502', name: 'Priya Verma', email: 'priya@example.in', referrals: 38, joined: 24, earned: '₹11,200', status: 'Active' },
  { id: 'A-503', name: 'Aditya Singh', email: 'aditya@example.in', referrals: 25, joined: 18, earned: '₹8,650', status: 'Paused' },
  { id: 'A-504', name: 'Neha Gupta', email: 'neha@example.in', referrals: 19, joined: 12, earned: '₹5,400', status: 'Active' },
  { id: 'A-505', name: 'Ishaan Kapoor', email: 'ishaan@example.in', referrals: 15, joined: 9, earned: '₹3,800', status: 'Banned' },
  { id: 'A-506', name: 'Sneha Reddy', email: 'sneha@example.in', referrals: 12, joined: 7, earned: '₹2,900', status: 'Active' },
];

export const adminRevenueSeries: { month: string; revenue: number; users: number }[] = [
  { month: 'Jan', revenue: 320000, users: 18200 },
  { month: 'Feb', revenue: 345000, users: 19600 },
  { month: 'Mar', revenue: 410000, users: 21400 },
  { month: 'Apr', revenue: 392000, users: 22800 },
  { month: 'May', revenue: 458000, users: 24100 },
  { month: 'Jun', revenue: 510000, users: 24800 },
  { month: 'Jul', revenue: 540000, users: 25042 },
];

export const adminPlanDistribution: { name: string; value: number; color: string }[] = [
  { name: 'Starter', value: 12400, color: 'hsl(var(--chart-3))' },
  { name: 'Pro', value: 9800, color: 'hsl(var(--chart-1))' },
  { name: 'Lifetime', value: 2400, color: 'hsl(var(--chart-2))' },
  { name: 'Trial', value: 442, color: 'hsl(var(--chart-5))' },
];

export const adminCategoryDistribution: { name: string; value: number; color: string }[] = [
  { name: 'Marketing', value: 32, color: 'hsl(var(--chart-1))' },
  { name: 'AI Tools', value: 28, color: 'hsl(var(--chart-2))' },
  { name: 'Business', value: 22, color: 'hsl(var(--chart-4))' },
  { name: 'Content', value: 18, color: 'hsl(var(--chart-3))' },
  { name: 'Sales', value: 12, color: 'hsl(var(--chart-5))' },
];

export const adminWebsiteContent = {
  hero: {
    eyebrow: 'Premium career growth platform',
    titleLine1: 'Learn Skills.',
    titleLine2: 'Build Your Future.',
    titleLine3: 'Unlock Opportunities.',
    subtitle:
      'Master practical skills, earn certificates, join a supportive learning community, and unlock career opportunities.',
    primaryCta: 'Start Learning',
    secondaryCta: 'Explore Courses',
  },
  stats: [
    { label: 'Students', value: '25000', suffix: '+', icon: 'Users' },
    { label: 'Lessons', value: '150', suffix: '+', icon: 'BookOpen' },
    { label: 'Courses', value: '20', suffix: '+', icon: 'GraduationCap' },
    { label: 'Completion Rate', value: '95', suffix: '%', icon: 'TrendingUp' },
  ],
  footer: {
    description:
      'Learn valuable skills, earn certificates, join a community, and build a successful career — all in one premium platform.',
    email: 'hello@nextup.in',
    phone: '+91 98765 43210',
    address: 'Connaught Place, New Delhi, India',
  },
  contact: {
    email: 'hello@nextup.in',
    phone: '+91 98765 43210',
    address: 'Connaught Place, New Delhi, India',
    hours: 'Mon–Fri, 9am–6pm IST',
  },
  company: {
    name: 'NextUp',
    tagline: 'Learn Skills. Build Your Future. Unlock Opportunities.',
    founded: '2024',
    legalName: 'NextUp Learning Pvt. Ltd.',
    gstin: '07ABCDE1234F1Z5',
  },
};

export const adminPermissions: {
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Viewer';
  permissions: string[];
  lastActive: string;
}[] = [
  { name: 'NextUp Admin', email: 'admin@nextup.in', role: 'Super Admin', permissions: ['All access'], lastActive: 'Just now' },
  { name: 'Ananya Iyer', email: 'ananya@nextup.in', role: 'Admin', permissions: ['Users', 'Courses', 'Certificates'], lastActive: '2h ago' },
  { name: 'Rohan Mehta', email: 'rohan@nextup.in', role: 'Editor', permissions: ['Courses', 'Website Content'], lastActive: '1d ago' },
  { name: 'Priya Verma', email: 'priya@nextup.in', role: 'Viewer', permissions: ['Analytics (read-only)'], lastActive: '3d ago' },
];

export const adminNav: { label: string; href: string; icon: string; group: string }[] = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', group: 'Overview' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3', group: 'Overview' },

  { label: 'Users', href: '/admin/users', icon: 'Users', group: 'Manage' },
  { label: 'Roles & Permissions', href: '/admin/roles', icon: 'ShieldCheck', group: 'Manage' },
  { label: 'Courses', href: '/admin/courses', icon: 'BookOpen', group: 'Manage' },
  { label: 'Live Classes', href: '/admin/live-classes', icon: 'Video', group: 'Manage' },
  { label: 'Certificates', href: '/admin/certificates', icon: 'Award', group: 'Manage' },

  { label: 'Packages (Pricing)', href: '/admin/pricing', icon: 'CreditCard', group: 'Monetization' },
  { label: 'Orders & Approvals', href: '/admin/orders', icon: 'ShoppingBag', group: 'Monetization' },
  { label: 'Sales CRM', href: '/admin/crm', icon: 'TrendingUp', group: 'Monetization' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'Tag', group: 'Monetization' },
  { label: 'Payments & Payouts', href: '/admin/wallet', icon: 'Wallet', group: 'Monetization' },
  { label: 'Payment Methods', href: '/admin/wallet/payment-methods', icon: 'Sliders', group: 'Monetization' },
  { label: 'Microtasks & Offers', href: '/admin/microtasks', icon: 'CheckSquare', group: 'Monetization' },
  { label: 'Affiliates & Partners', href: '/admin/affiliate', icon: 'Network', group: 'Monetization' },

  { label: 'Community', href: '/admin/community', icon: 'MessageSquare', group: 'Engage' },
  { label: 'Support Tickets', href: '/admin/support', icon: 'LifeBuoy', group: 'Engage' },
  { label: 'Notification Center', href: '/admin/notifications', icon: 'Bell', group: 'Engage' },

  { label: 'Website CMS', href: '/admin/content', icon: 'FileText', group: 'Platform' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: 'Star', group: 'Platform' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings', group: 'Platform' },
];
