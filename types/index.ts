export type Role = 'superadmin' | 'admin' | 'instructor' | 'student' | 'affiliate' | 'user';
export type Membership = 'starter' | 'pro' | 'lifetime';

export interface BaseUser {
  name: string;
  email: string;
  role: Role;
}

export interface SessionUser extends BaseUser {
  uid: string;
  membership: Membership;
  phone?: string;
  photoURL?: string;
  address?: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: SessionUser;
}

export interface FirestoreProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  role: Role;
  membership: Membership;
  address?: string;
  suspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgress {
  title: string;
  instructor: string;
  progress: number;
  lesson: string;
  gradient: string;
  icon: string;
  status: 'in-progress' | 'completed' | 'locked';
}

export interface Certificate {
  id: string;
  recipientName: string;
  courseName: string;
  instructor: string;
  issueDate: string;
  grade: string;
  gradient: string;
  icon: string;
}

export interface WalletTransaction {
  type: 'in' | 'out';
  label: string;
  amount: string;
  date: string;
}

export interface Discussion {
  name: string;
  role: string;
  avatar: string;
  topic: string;
  category: string;
  replies: number;
  likes: number;
  time: string;
  trending?: boolean;
}

export interface LiveClass {
  title: string;
  host: string;
  hostAvatar: string;
  date: string;
  time: string;
  watching: string;
  category: string;
}
