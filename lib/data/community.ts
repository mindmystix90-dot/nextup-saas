import type { Discussion, LiveClass } from '@/types';

export const trendingTopics: string[] = [
  'AI for content',
  'Freelance pricing',
  'SEO in 2026',
  'Personal branding',
  'Cold outreach',
  'LinkedIn growth',
];

export const studentQuestions: {
  name: string;
  avatar: string;
  question: string;
  course: string;
  replies: number;
  time: string;
}[] = [
  {
    name: 'Ishita Banerjee',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    question: 'Which AI tool is best for repurposing long videos into shorts?',
    course: 'AI Tools for Work',
    replies: 12,
    time: '1h ago',
  },
  {
    name: 'Devansh Patel',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    question: 'How do I price my first freelance project in India?',
    course: 'Freelance Career Launch',
    replies: 8,
    time: '3h ago',
  },
  {
    name: 'Meera Krishnan',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    question: 'What should my first LinkedIn post as a beginner look like?',
    course: 'Build Your Personal Brand',
    replies: 15,
    time: '6h ago',
  },
];

export const mentorPosts: {
  name: string;
  role: string;
  avatar: string;
  title: string;
  excerpt: string;
  likes: number;
  comments: number;
  time: string;
}[] = [
  {
    name: 'Ananya Iyer',
    role: 'Marketing Lead Mentor',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    title: '5 marketing experiments I ran this month (and what worked)',
    excerpt: 'A quick breakdown of what moved the needle for our partner brands in July — and the metrics behind each decision.',
    likes: 214,
    comments: 38,
    time: 'Yesterday',
  },
  {
    name: 'Rohan Mehta',
    role: 'AI & Automation Mentor',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    title: 'Build your first AI workflow in under 30 minutes',
    excerpt: 'A step-by-step guide to automating a repetitive task at work using tools you already use every day.',
    likes: 326,
    comments: 54,
    time: '2 days ago',
  },
];

export const communityDiscussions: Discussion[] = [
  {
    name: 'Aarav Sharma',
    role: 'Marketing Executive',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    topic: 'Best AI tools for content repurposing in 2026?',
    category: 'AI Tools',
    replies: 24,
    likes: 87,
    time: '2h ago',
    trending: true,
  },
  {
    name: 'Karan Malhotra',
    role: 'Freelance Designer',
    avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    topic: 'How I landed my first 3 clients as a freelancer',
    category: 'Freelancing',
    replies: 58,
    likes: 142,
    time: '5h ago',
    trending: true,
  },
  {
    name: 'Priya Verma',
    role: 'Startup Founder',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    topic: 'Hiring tips for early-stage teams in India',
    category: 'Business',
    replies: 31,
    likes: 64,
    time: '1d ago',
  },
  {
    name: 'Neha Gupta',
    role: 'AI Engineer',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    topic: 'Tips for presenting technical work to non-technical stakeholders',
    category: 'Communication',
    replies: 19,
    likes: 52,
    time: '1d ago',
  },
];

export const communityLiveClasses: LiveClass[] = [
  {
    title: 'Live Q&A: AI Tools for Your Workflow',
    host: 'Rohan Mehta',
    hostAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    date: 'Tomorrow',
    time: '6:00 PM',
    watching: '1,240 learners already registered',
    category: 'AI Tools',
  },
  {
    title: 'Content Creation Masterclass',
    host: 'Karan Malhotra',
    hostAvatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    date: 'Fri, 21 Jul',
    time: '7:00 PM',
    watching: '860 learners already registered',
    category: 'Content',
  },
  {
    title: 'Marketing Analytics Deep Dive',
    host: 'Ananya Iyer',
    hostAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
    date: 'Mon, 24 Jul',
    time: '5:30 PM',
    watching: '520 learners already registered',
    category: 'Marketing',
  },
];
