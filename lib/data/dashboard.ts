export const dashboardStats: {
  label: string;
  value: string;
  icon: string;
  color: string;
}[] = [
  { label: 'Courses in progress', value: '3', icon: 'BookOpen', color: 'text-primary' },
  { label: 'Certificates earned', value: '5', icon: 'Trophy', color: 'text-amber-500' },
  { label: 'Hours learned', value: '47h', icon: 'Clock', color: 'text-emerald-500' },
  { label: 'Community points', value: '1,240', icon: 'TrendingUp', color: 'text-violet-500' },
];

export const enrolledCourses: {
  title: string;
  instructor: string;
  progress: number;
  lesson: string;
  gradient: string;
  icon: string;
}[] = [
  { title: 'Digital Marketing Mastery', instructor: 'Ananya Iyer', progress: 78, lesson: 'Lesson 9 of 12', gradient: 'from-blue-500 to-cyan-400', icon: 'Megaphone' },
  { title: 'AI Tools for Work', instructor: 'Rohan Mehta', progress: 64, lesson: 'Lesson 7 of 11', gradient: 'from-violet-500 to-purple-500', icon: 'Bot' },
  { title: 'Content Creation Bootcamp', instructor: 'Karan Malhotra', progress: 92, lesson: 'Lesson 11 of 12', gradient: 'from-emerald-500 to-teal-400', icon: 'PenTool' },
];

export const completedCourses: {
  title: string;
  instructor: string;
  progress: number;
  lesson: string;
  gradient: string;
  icon: string;
}[] = [
  { title: 'Speak with Confidence', instructor: 'Neha Gupta', progress: 100, lesson: 'Completed · 6h', gradient: 'from-amber-500 to-orange-400', icon: 'MessageSquare' },
  { title: 'Business Strategy 101', instructor: 'Priya Verma', progress: 100, lesson: 'Completed · 10h', gradient: 'from-emerald-500 to-teal-400', icon: 'Briefcase' },
  { title: 'Freelance Career Launch', instructor: 'Sneha Reddy', progress: 100, lesson: 'Completed · 8h', gradient: 'from-teal-500 to-emerald-400', icon: 'Laptop' },
];

export const lockedCourses: {
  title: string;
  instructor: string;
  progress: number;
  lesson: string;
  gradient: string;
  icon: string;
}[] = [
  { title: 'Sales Mastery Pro', instructor: 'Aditya Singh', progress: 0, lesson: 'Unlock with Pro plan', gradient: 'from-indigo-500 to-blue-500', icon: 'ShoppingBag' },
  { title: 'AI for Business Growth', instructor: 'Rohan Mehta', progress: 0, lesson: 'Unlock with Lifetime plan', gradient: 'from-violet-500 to-indigo-500', icon: 'Bot' },
  { title: 'Build Your Personal Brand', instructor: 'Ishaan Kapoor', progress: 0, lesson: 'Unlock with Pro plan', gradient: 'from-fuchsia-500 to-purple-500', icon: 'UserCircle' },
];

export const recentActivity: {
  icon: string;
  text: string;
  time: string;
  color: string;
}[] = [
  { icon: 'CheckCircle2', text: 'Completed "SEO Fundamentals" lesson', time: '2h ago', color: 'text-success' },
  { icon: 'Trophy', text: 'Earned "Marketing Basics" certificate', time: '1d ago', color: 'text-amber-500' },
  { icon: 'PlayCircle', text: 'Started "AI Tools for Work" course', time: '2d ago', color: 'text-primary' },
  { icon: 'MessageSquare', text: 'Replied in Community discussion', time: '3d ago', color: 'text-blue-500' },
];

export const announcements: {
  tag: string;
  tagColor: string;
  title: string;
  text: string;
}[] = [
  { tag: 'Live Class', tagColor: 'bg-red-500/10 text-red-500', title: 'Scaling with AI — Friday 7 PM', text: 'Join our weekly masterclass on applying AI to grow your business.' },
  { tag: 'New Course', tagColor: 'bg-primary/10 text-primary', title: 'Personal Branding is now live', text: 'A 9-lesson course to help you stand out and get noticed.' },
  { tag: 'Community', tagColor: 'bg-emerald-500/10 text-emerald-500', title: 'July networking event', text: 'Connect with 200+ members in our virtual meetup this Saturday.' },
];

export const quickActions: {
  icon: string;
  label: string;
  href: string;
}[] = [
  { icon: 'BookOpen', label: 'Browse Courses', href: '/courses' },
  { icon: 'Award', label: 'My Certificates', href: '/dashboard/certificates' },
  { icon: 'Users', label: 'Community', href: '/dashboard/community' },
  { icon: 'Gift', label: 'Refer a Friend', href: '/dashboard/affiliate' },
];

export const walletBalance = '₹3,199';
export const totalEarnings = '₹18,450';
export const walletTransactions: {
  type: string;
  label: string;
  amount: string;
  date: string;
}[] = [];

export const paymentMethods: { brand: string; last4: string; exp: string }[] = [
  { brand: 'Visa', last4: '4242', exp: '08/27' },
  { brand: 'RuPay', last4: '8810', exp: '11/26' },
];

export const referralStats: {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}[] = [
  { value: 42, suffix: '', label: 'Total Referrals', icon: 'Users' },
  { value: 28, suffix: '', label: 'Joined', icon: 'TrendingUp' },
  { value: 12400, suffix: '', label: 'Earned (INR)', icon: 'Trophy' },
  { value: 67, suffix: '%', label: 'Conversion', icon: 'Sparkles' },
];

export const referrals: {
  name: string;
  email: string;
  status: string;
  date: string;
  earned: string;
}[] = [
  { name: 'Aarav Sharma', email: 'aarav@example.in', status: 'Joined', date: '16 Jul', earned: '₹999' },
  { name: 'Priya Verma', email: 'priya@example.in', status: 'Joined', date: '12 Jul', earned: '₹999' },
  { name: 'Neha Gupta', email: 'neha@example.in', status: 'Pending', date: '10 Jul', earned: '—' },
  { name: 'Aditya Singh', email: 'aditya@example.in', status: 'Joined', date: '4 Jul', earned: '₹4,999' },
];

export const adminStats: {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}[] = [
  { value: 25000, suffix: '+', label: 'Total Users', icon: 'Users' },
  { value: 20, suffix: '+', label: 'Courses', icon: 'BookOpen' },
  { value: 4800000, suffix: '', label: 'Revenue (INR)', icon: 'Trophy' },
  { value: 95, suffix: '%', label: 'Completion', icon: 'TrendingUp' },
];

export const adminUsers: {
  name: string;
  email: string;
  plan: string;
  status: string;
  avatar: string;
}[] = [
  { name: 'Aarav Sharma', email: 'aarav@example.in', plan: 'Pro', status: 'Active', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { name: 'Priya Verma', email: 'priya@example.in', plan: 'Lifetime', status: 'Active', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { name: 'Aditya Singh', email: 'aditya@example.in', plan: 'Pro', status: 'Active', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { name: 'Neha Gupta', email: 'neha@example.in', plan: 'Starter', status: 'Trial', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
  { name: 'Ishaan Kapoor', email: 'ishaan@example.in', plan: 'Lifetime', status: 'Active', avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop' },
];

export const adminActivity: string[] = [
  'New course "AI for Business Growth" published',
  '142 new signups in the last 24 hours',
  'Weekly live class completed — 1,284 attendees',
  'Payout of ₹2,10,000 processed to affiliates',
];

export const communityDiscussions: {
  name: string;
  role: string;
  avatar: string;
  topic: string;
  replies: number;
  likes: number;
  time: string;
  trending?: boolean;
}[] = [
  { name: 'Aarav Sharma', role: 'Marketing Executive', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', topic: 'Best AI tools for content repurposing in 2024?', replies: 24, likes: 87, time: '2h ago', trending: true },
  { name: 'Karan Malhotra', role: 'Freelance Designer', avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', topic: 'How I landed my first 3 clients as a freelancer', replies: 58, likes: 142, time: '5h ago', trending: true },
  { name: 'Priya Verma', role: 'Startup Founder', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', topic: 'Hiring tips for early-stage teams in India', replies: 31, likes: 64, time: '1d ago' },
];

export const upcomingLiveClass = {
  title: 'Live Q&A: AI Tools for Your Workflow',
  date: 'Tomorrow, 6:00 PM IST',
  watching: '1,240 learners already registered',
};

export const liveClasses: {
  title: string;
  host: string;
  date: string;
  time: string;
}[] = [
  { title: 'Live Q&A: AI Tools for Your Workflow', host: 'Rohan Mehta', date: 'Tomorrow', time: '6:00 PM' },
  { title: 'Content Creation Masterclass', host: 'Karan Malhotra', date: 'Fri, 21 Jul', time: '7:00 PM' },
  { title: 'Marketing Analytics Deep Dive', host: 'Ananya Iyer', date: 'Mon, 24 Jul', time: '5:30 PM' },
];

export const recommendedCourses: {
  title: string;
  instructor: string;
  category: string;
  rating: number;
  duration: string;
  price: string;
  icon: string;
  gradient: string;
  reason: string;
}[] = [
  {
    title: 'Sales Mastery Pro',
    instructor: 'Aditya Singh',
    category: 'Sales',
    rating: 4.9,
    duration: '11h',
    price: '₹3,999',
    icon: 'ShoppingBag',
    gradient: 'from-indigo-500 to-blue-500',
    reason: 'Because you completed Business Strategy 101',
  },
  {
    title: 'AI for Business Growth',
    instructor: 'Rohan Mehta',
    category: 'AI Tools',
    rating: 4.9,
    duration: '13h',
    price: '₹4,499',
    icon: 'Bot',
    gradient: 'from-violet-500 to-indigo-500',
    reason: 'Popular with AI Tools for Work learners',
  },
  {
    title: 'Build Your Personal Brand',
    instructor: 'Ishaan Kapoor',
    category: 'Branding',
    rating: 4.8,
    duration: '7h',
    price: '₹2,499',
    icon: 'UserCircle',
    gradient: 'from-fuchsia-500 to-purple-500',
    reason: 'Pairs well with Content Creation',
  },
];

export const weeklyProgress: { day: string; minutes: number }[] = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 60 },
  { day: 'Wed', minutes: 30 },
  { day: 'Thu', minutes: 75 },
  { day: 'Fri', minutes: 50 },
  { day: 'Sat', minutes: 90 },
  { day: 'Sun', minutes: 40 },
];
