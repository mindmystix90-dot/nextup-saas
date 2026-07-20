export const siteConfig = {
  name: 'NextUp',
  tagline: 'Learn Skills. Build Your Future. Unlock Opportunities.',
  email: 'hello@nextup.com',
  phone: '+91 98765 43210',
  address: 'Connaught Place, New Delhi, India',
  social: {
    twitter: '#',
    linkedin: '#',
    youtube: '#',
    instagram: '#',
  },
};

export const hero = {
  eyebrow: 'Premium career growth platform',
  title: ['Learn Skills.', 'Build Your Future.', 'Unlock Opportunities.'],
  subtitle:
    'Master practical skills, earn certificates, join a supportive learning community, and unlock career opportunities.',
  primaryCta: { label: 'Start Learning', href: '/register' },
  secondaryCta: { label: 'Explore Courses', href: '/courses' },
  socialProof: '25,000+ learners growing with NextUp',
};

export const stats: { value: number; suffix: string; label: string; icon: string }[] = [
  { value: 25000, suffix: '+', label: 'Students', icon: 'Users' },
  { value: 150, suffix: '+', label: 'Lessons', icon: 'BookOpen' },
  { value: 20, suffix: '+', label: 'Courses', icon: 'GraduationCap' },
  { value: 95, suffix: '%', label: 'Completion Rate', icon: 'TrendingUp' },
];

export const categories: {
  name: string;
  description: string;
  count: string;
  icon: string;
  gradient: string;
}[] = [
  { name: 'Digital Marketing', description: 'SEO, ads, funnels & growth', count: '24', icon: 'Megaphone', gradient: 'from-blue-500 to-cyan-400' },
  { name: 'AI Tools', description: 'Master the tools shaping work', count: '18', icon: 'Bot', gradient: 'from-violet-500 to-purple-500' },
  { name: 'Business', description: 'Strategy, ops & leadership', count: '32', icon: 'Briefcase', gradient: 'from-emerald-500 to-teal-400' },
  { name: 'Content Creation', description: 'Video, writing & design', count: '21', icon: 'PenTool', gradient: 'from-rose-500 to-pink-500' },
  { name: 'Communication', description: 'Speak, write & present', count: '15', icon: 'MessageSquare', gradient: 'from-amber-500 to-orange-400' },
  { name: 'Sales', description: 'Close deals with confidence', count: '12', icon: 'ShoppingBag', gradient: 'from-indigo-500 to-blue-500' },
  { name: 'Freelancing', description: 'Build a solo career', count: '9', icon: 'Laptop', gradient: 'from-teal-500 to-emerald-400' },
  { name: 'Personal Branding', description: 'Stand out & get noticed', count: '11', icon: 'UserCircle', gradient: 'from-fuchsia-500 to-purple-500' },
];

export const journey: {
  step: string;
  title: string;
  description: string;
  icon: string;
}[] = [
  { step: '01', title: 'Enroll', description: 'Pick a course and join instantly. No barriers, no friction.', icon: 'ClipboardCheck' },
  { step: '02', title: 'Learn', description: 'Bite-sized lessons designed by industry experts.', icon: 'BookOpen' },
  { step: '03', title: 'Practice', description: 'Apply what you learn with real-world projects.', icon: 'PlayCircle' },
  { step: '04', title: 'Earn Certificate', description: 'Get a verifiable certificate to showcase your skills.', icon: 'Trophy' },
  { step: '05', title: 'Grow', description: 'Unlock opportunities, referrals, and career growth.', icon: 'Rocket' },
];

export const certificateFeatures: {
  icon: string;
  title: string;
  text: string;
}[] = [
  { icon: 'ShieldCheck', title: 'Verifiable authenticity', text: 'Each certificate has a unique ID anyone can verify instantly.' },
  { icon: 'Trophy', title: 'Skill-backed', text: 'Earned through real coursework and practical projects, not attendance.' },
  { icon: 'TrendingUp', title: 'Career-ready', text: 'Designed to showcase your skills on LinkedIn and resumes.' },
];

export const certificateSample = {
  recipientName: 'Aarav Sharma',
  courseName: 'Digital Marketing Mastery',
  certificateId: 'NX-2024-08AF31',
  date: '15 July 2024',
};

export const communityFeatures: {
  icon: string;
  title: string;
  text: string;
}[] = [
  { icon: 'Video', title: 'Weekly Live Classes', text: 'Interactive sessions with experts' },
  { icon: 'Network', title: 'Networking', text: 'Connect with peers & mentors' },
  { icon: 'LifeBuoy', title: 'Student Support', text: 'Get help when you need it' },
];

export const opportunities: {
  icon: string;
  title: string;
  text: string;
  gradient: string;
}[] = [
  { icon: 'Handshake', title: 'Referrals', text: 'Get referred to partner companies by the NextUp network when you stand out.', gradient: 'from-blue-500 to-cyan-400' },
  { icon: 'Building2', title: 'Partner Programs', text: 'Access exclusive programs with brands and tools relevant to your field.', gradient: 'from-violet-500 to-purple-500' },
  { icon: 'Rocket', title: 'Career Opportunities', text: 'Discover roles curated for NextUp members and take the next step.', gradient: 'from-emerald-500 to-teal-400' },
];

export const pricing = {
  currency: '₹',
  plans: [
    {
      name: 'Starter',
      price: '₹499',
      period: '/month',
      description: 'Perfect to explore the platform and try a few lessons.',
      features: ['Access to 5 starter lessons', 'Community read access', 'Basic progress tracking', 'Email support'],
      cta: 'Start Free',
    },
    {
      name: 'Pro',
      price: '₹999',
      period: '/month',
      description: 'Everything you need to learn seriously and grow.',
      features: ['All 20+ courses', 'Verifiable certificates', 'Weekly live classes', 'Full community access', 'Priority support', 'Progress analytics'],
      cta: 'Go Pro',
      featured: true,
      badge: 'Most Popular',
    },
    {
      name: 'Lifetime',
      price: '₹4,999',
      period: 'one-time',
      description: 'Pay once. Learn forever. No recurring fees.',
      features: ['Everything in Pro', 'Lifetime access', 'All future courses', 'Exclusive alumni network', 'Early feature access', '1:1 onboarding call'],
      cta: 'Get Lifetime',
    },
  ],
  guarantee: 'All plans include a 7-day money-back guarantee. No questions asked.',
};

export const courses: {
  title: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  reviews: number;
  duration: string;
  students: number;
  price: string;
  oldPrice?: string;
  icon: string;
  gradient: string;
}[] = [
  { title: 'Digital Marketing Mastery', instructor: 'Ananya Iyer', category: 'Marketing', level: 'Beginner', rating: 4.9, reviews: 1280, duration: '12h', students: 4200, price: '₹2,499', oldPrice: '₹4,999', icon: 'Megaphone', gradient: 'from-blue-500 to-cyan-400' },
  { title: 'AI Tools for Work', instructor: 'Rohan Mehta', category: 'AI Tools', level: 'Intermediate', rating: 4.8, reviews: 940, duration: '9h', students: 3100, price: '₹2,999', oldPrice: '₹5,999', icon: 'Bot', gradient: 'from-violet-500 to-purple-500' },
  { title: 'Business Strategy 101', instructor: 'Priya Verma', category: 'Business', level: 'Beginner', rating: 4.7, reviews: 760, duration: '10h', students: 2800, price: '₹1,999', icon: 'Briefcase', gradient: 'from-emerald-500 to-teal-400' },
  { title: 'Content Creation Bootcamp', instructor: 'Karan Malhotra', category: 'Content', level: 'Intermediate', rating: 4.9, reviews: 1520, duration: '14h', students: 5100, price: '₹3,499', oldPrice: '₹6,999', icon: 'PenTool', gradient: 'from-rose-500 to-pink-500' },
  { title: 'Speak with Confidence', instructor: 'Neha Gupta', category: 'Communication', level: 'Beginner', rating: 4.8, reviews: 610, duration: '6h', students: 1900, price: '₹1,499', icon: 'MessageSquare', gradient: 'from-amber-500 to-orange-400' },
  { title: 'Sales Mastery Pro', instructor: 'Aditya Singh', category: 'Sales', level: 'Advanced', rating: 4.9, reviews: 880, duration: '11h', students: 2400, price: '₹3,999', oldPrice: '₹7,999', icon: 'ShoppingBag', gradient: 'from-indigo-500 to-blue-500' },
  { title: 'Freelance Career Launch', instructor: 'Sneha Reddy', category: 'Freelancing', level: 'Beginner', rating: 4.7, reviews: 430, duration: '8h', students: 1500, price: '₹1,999', icon: 'Laptop', gradient: 'from-teal-500 to-emerald-400' },
  { title: 'Build Your Personal Brand', instructor: 'Ishaan Kapoor', category: 'Branding', level: 'Intermediate', rating: 4.8, reviews: 720, duration: '7h', students: 2100, price: '₹2,499', icon: 'UserCircle', gradient: 'from-fuchsia-500 to-purple-500' },
  { title: 'AI for Business Growth', instructor: 'Rohan Mehta', category: 'AI Tools', level: 'Advanced', rating: 4.9, reviews: 540, duration: '13h', students: 1800, price: '₹4,499', oldPrice: '₹8,999', icon: 'Bot', gradient: 'from-violet-500 to-indigo-500' },
];

export const testimonials: {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  review: string;
}[] = [
  {
    name: 'Aarav Sharma',
    role: 'Digital Marketing Executive',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
    rating: 5,
    review: 'NextUp completely changed how I approach learning. The courses are practical, the community is supportive, and the certificate helped me land a better role at a top agency.',
  },
  {
    name: 'Priya Verma',
    role: 'Freelance Content Creator',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
    rating: 5,
    review: 'The content creation track is gold. I went from hobbyist to booking real clients within three months. The live classes keep me accountable and motivated.',
  },
  {
    name: 'Aditya Singh',
    role: 'Startup Founder',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
    rating: 5,
    review: 'As a founder, I wear many hats. NextUp helped me sharpen sales, marketing, and AI skills in one place. The quality is genuinely premium and worth every rupee.',
  },
  {
    name: 'Neha Gupta',
    role: 'AI Engineer',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
    rating: 5,
    review: 'The AI Tools courses are surprisingly deep for a general platform. I recommend NextUp to every junior engineer on my team at the office.',
  },
  {
    name: 'Ishaan Kapoor',
    role: 'Content Strategist',
    avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
    rating: 5,
    review: 'Beautiful platform, beautiful content. The certificate verification actually impressed my employer. Worth every penny spent on the Pro plan.',
  },
  {
    name: 'Sneha Reddy',
    role: 'Sales Lead',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop',
    rating: 5,
    review: 'The sales and communication tracks are practical, not fluffy. My team\'s close rate went up significantly after we all took the course together.',
  },
];

export const footerSections: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Courses', href: '/courses' },
      { label: 'Community', href: '/community' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Support', href: '/support' },
      { label: 'Affiliate', href: '/affiliate' },
      { label: 'Certificates', href: '/certificates' },
      { label: 'Help Center', href: '/support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Cookies', href: '#' },
      { label: 'Refunds', href: '#' },
    ],
  },
];

export const team: {
  name: string;
  role: string;
  avatar: string;
}[] = [
  { name: 'Ananya Iyer', role: 'Founder & CEO', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
  { name: 'Rohan Mehta', role: 'Head of Curriculum', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
  { name: 'Priya Verma', role: 'Head of Community', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
  { name: 'Karan Malhotra', role: 'Lead Instructor', avatar: 'https://images.pexels.com/photos/220457/pexels-photo-220457.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop' },
];

export const values: {
  icon: string;
  title: string;
  text: string;
}[] = [
  { icon: 'ClipboardCheck', title: 'Practical first', text: 'Every course is built around real-world application, not theory.' },
  { icon: 'ShieldCheck', title: 'Learner-obsessed', text: 'We design every detail around what helps you actually grow.' },
  { icon: 'Trophy', title: 'Quality over quantity', text: 'Fewer courses, deeper content, expert instructors.' },
  { icon: 'Rocket', title: 'Always improving', text: 'We ship updates weekly based on learner feedback.' },
];

export const faqs: { q: string; a: string }[] = [
  { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your Pro subscription at any time from your dashboard. You keep access until the end of your billing period.' },
  { q: 'Are certificates really verifiable?', a: 'Absolutely. Every certificate has a unique verification ID that anyone can check to confirm its authenticity.' },
  { q: 'What happens if I upgrade to Lifetime later?', a: 'You can upgrade from Pro to Lifetime anytime — we will credit your most recent month toward the Lifetime price.' },
  { q: 'Is there a money-back guarantee?', a: 'Yes, all paid plans include a 7-day no-questions-asked money-back guarantee.' },
  { q: 'Do you offer team or enterprise plans?', a: 'We do. Contact us and we will tailor a plan for your team or organization.' },
];

export const supportFaqs: { q: string; a: string }[] = [
  { q: 'How do I reset my password?', a: 'Visit the forgot password page and enter your email. We will send a secure reset link valid for 30 minutes.' },
  { q: 'Can I download lessons for offline use?', a: 'Yes, Pro and Lifetime members can download lessons within the NextUp app for offline viewing.' },
  { q: 'How do certificates work?', a: 'Once you complete a course, a verifiable certificate is generated with a unique ID you can share with employers.' },
  { q: 'How do I cancel my subscription?', a: 'You can cancel anytime from your dashboard under Profile → Billing. Access continues until the end of your billing period.' },
  { q: 'Do you offer refunds?', a: 'Yes, all paid plans include a 7-day no-questions-asked money-back guarantee.' },
];

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'Community', href: '/community' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
