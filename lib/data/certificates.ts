import type { Certificate } from '@/types';

export const certificates: Certificate[] = [
  {
    id: 'NX-2024-08AF31',
    recipientName: 'Aarav Sharma',
    courseName: 'Digital Marketing Mastery',
    instructor: 'Ananya Iyer',
    issueDate: '15 July 2024',
    grade: 'A+',
    gradient: 'from-blue-500 to-cyan-400',
    icon: 'Megaphone',
  },
  {
    id: 'NX-2024-19BD52',
    recipientName: 'Aarav Sharma',
    courseName: 'AI Tools for Work',
    instructor: 'Rohan Mehta',
    issueDate: '2 August 2024',
    grade: 'A',
    gradient: 'from-violet-500 to-purple-500',
    icon: 'Bot',
  },
  {
    id: 'NX-2024-27CE63',
    recipientName: 'Aarav Sharma',
    courseName: 'Content Creation Bootcamp',
    instructor: 'Karan Malhotra',
    issueDate: '18 August 2024',
    grade: 'A+',
    gradient: 'from-emerald-500 to-teal-400',
    icon: 'PenTool',
  },
  {
    id: 'NX-2024-35DF74',
    recipientName: 'Aarav Sharma',
    courseName: 'Speak with Confidence',
    instructor: 'Neha Gupta',
    issueDate: '5 September 2024',
    grade: 'A',
    gradient: 'from-amber-500 to-orange-400',
    icon: 'MessageSquare',
  },
  {
    id: 'NX-2024-42EG85',
    recipientName: 'Aarav Sharma',
    courseName: 'Business Strategy 101',
    instructor: 'Priya Verma',
    issueDate: '22 September 2024',
    grade: 'A+',
    gradient: 'from-indigo-500 to-blue-500',
    icon: 'Briefcase',
  },
];

export const verifiedCertificates = [
  { recipientName: 'Priya Verma', courseName: 'Content Creation Bootcamp', id: 'NX-2024-11PV29', date: '8 July 2024' },
  { recipientName: 'Aditya Singh', courseName: 'Sales Mastery Pro', id: 'NX-2024-23AS14', date: '19 July 2024' },
  { recipientName: 'Neha Gupta', courseName: 'AI for Business Growth', id: 'NX-2024-37NG08', date: '3 August 2024' },
];
