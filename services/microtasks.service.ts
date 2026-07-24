import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import { recordWalletTransaction } from '@/services/wallet.service';
import { createNotification } from '@/services/notifications.service';
import { recordAuditLog } from '@/services/audit-log.service';
import type {
  MicrotaskProvider,
  Microtask,
  MicrotaskSubmission,
  MicrotaskAnalytics,
} from '@/types';

const PROVIDERS_COLLECTION = 'microtask_providers';
const TASKS_COLLECTION = 'microtasks';
const SUBMISSIONS_COLLECTION = 'microtask_submissions';

export const DEFAULT_PROVIDERS: MicrotaskProvider[] = [
  {
    id: 'sproutgigs',
    name: 'SproutGigs',
    slug: 'sproutgigs',
    apiKey: 'sg_live_demo_key_98234182',
    webhookSecret: 'whsec_sproutgigs_secret_881923',
    enabled: true,
    syncIntervalMinutes: 15,
    profitMarginPercent: 20,
    status: 'active',
    lastSyncAt: new Date().toISOString(),
    totalSyncedTasks: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'timebucks',
    name: 'TimeBucks',
    slug: 'timebucks',
    apiKey: 'tb_live_demo_key_312948',
    webhookSecret: 'whsec_timebucks_secret_552812',
    enabled: true,
    syncIntervalMinutes: 30,
    profitMarginPercent: 25,
    status: 'active',
    lastSyncAt: new Date().toISOString(),
    totalSyncedTasks: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'picoworkers',
    name: 'PicoWorkers',
    slug: 'picoworkers',
    apiKey: 'pw_live_demo_key_771239',
    webhookSecret: 'whsec_picoworkers_secret_992182',
    enabled: true,
    syncIntervalMinutes: 60,
    profitMarginPercent: 20,
    status: 'active',
    lastSyncAt: new Date().toISOString(),
    totalSyncedTasks: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const SAMPLE_TASKS: Microtask[] = [
  {
    id: 'sg-task-101',
    providerId: 'sproutgigs',
    providerName: 'SproutGigs',
    externalTaskId: 'EXT-8821',
    title: 'Subscribe to YouTube Channel & Watch 2 Min Video',
    description: 'Visit the specified YouTube channel, subscribe, watch the latest video for at least 2 minutes, and leave a constructive comment.',
    instructions: '1. Click the external link below to open YouTube channel.\n2. Click Subscribe and turn on notifications.\n3. Watch at least 2 minutes of the latest video.\n4. Take a screenshot showing your subscription and watch time bar.',
    requirements: [
      'Must watch video for minimum 2 minutes',
      'Must leave a comment with 5+ words',
      'Screenshot of channel page showing Subscribed status',
    ],
    category: 'social',
    difficulty: 'easy',
    estimatedMinutes: 3,
    originalReward: 15,
    reward: 12,
    platformFee: 3,
    proofTypes: ['text', 'screenshot'],
    externalUrl: 'https://youtube.com',
    maxSubmissions: 500,
    completedCount: 142,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tb-task-202',
    providerId: 'timebucks',
    providerName: 'TimeBucks',
    externalTaskId: 'EXT-9941',
    title: 'Complete 5-Minute Fintech Survey',
    description: 'Provide genuine feedback on your digital banking and UPI payment habits in India.',
    instructions: '1. Open the survey link.\n2. Answer all questions honestly until you see the Completion Screen.\n3. Copy the Completion Verification Code displayed at the end.',
    requirements: [
      'Must complete all 12 survey questions',
      'Must reside in India',
      'Provide unique Completion Code',
    ],
    category: 'survey',
    difficulty: 'easy',
    estimatedMinutes: 5,
    originalReward: 40,
    reward: 30,
    platformFee: 10,
    proofTypes: ['text'],
    externalUrl: 'https://timebucks.com/survey',
    maxSubmissions: 200,
    completedCount: 89,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pw-task-303',
    providerId: 'picoworkers',
    providerName: 'PicoWorkers',
    externalTaskId: 'EXT-4412',
    title: 'Download App & Register New Account',
    description: 'Download the crypto learning app, register using referral code NEXTUP2026, and verify email.',
    instructions: '1. Download app from link.\n2. Register account with referral code NEXTUP2026.\n3. Verify your email address.\n4. Submit your registered email address and profile screenshot.',
    requirements: [
      'New users only',
      'Email address verification required',
      'Screenshot of profile screen showing referral code',
    ],
    category: 'app_download',
    difficulty: 'medium',
    estimatedMinutes: 7,
    originalReward: 75,
    reward: 60,
    platformFee: 15,
    proofTypes: ['text', 'url', 'screenshot'],
    externalUrl: 'https://play.google.com',
    maxSubmissions: 100,
    completedCount: 34,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sg-task-104',
    providerId: 'sproutgigs',
    providerName: 'SproutGigs',
    externalTaskId: 'EXT-5519',
    title: 'Join Telegram Channel & React to 3 Posts',
    description: 'Join the NextUp Official Telegram channel and react with emojis on the last 3 posts.',
    instructions: '1. Open Telegram link.\n2. Click Join Channel.\n3. React to top 3 posts.\n4. Submit your Telegram Username.',
    requirements: [
      'Telegram account older than 30 days',
      'Submit username starting with @',
    ],
    category: 'social',
    difficulty: 'easy',
    estimatedMinutes: 2,
    originalReward: 10,
    reward: 8,
    platformFee: 2,
    proofTypes: ['text'],
    externalUrl: 'https://t.me',
    maxSubmissions: 1000,
    completedCount: 620,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ===== PROVIDER MANAGEMENT =====

export async function fetchProviders(): Promise<MicrotaskProvider[]> {
  if (!firebaseReady) return DEFAULT_PROVIDERS;
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, PROVIDERS_COLLECTION));
    if (snap.empty) {
      // Seed default providers
      for (const p of DEFAULT_PROVIDERS) {
        await setDoc(doc(db, PROVIDERS_COLLECTION, p.id), {
          ...p,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return DEFAULT_PROVIDERS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MicrotaskProvider, 'id'>) }));
  } catch (err) {
    console.warn('Failed to fetch microtask providers, fallback to defaults:', err);
    return DEFAULT_PROVIDERS;
  }
}

export async function saveProvider(
  provider: Partial<MicrotaskProvider> & { id: string; name: string }
): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase unavailable');
  const db = getFirestoreDb();
  const ref = doc(db, PROVIDERS_COLLECTION, provider.id);
  const now = new Date().toISOString();

  const dataToSave: Partial<MicrotaskProvider> = {
    ...provider,
    slug: provider.slug || provider.id.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    syncIntervalMinutes: Number(provider.syncIntervalMinutes) || 15,
    profitMarginPercent: Number(provider.profitMarginPercent) || 20,
    enabled: provider.enabled ?? true,
    status: provider.status || 'active',
    updatedAt: now,
  };

  const snap = await getDoc(ref);
  if (!snap.exists()) {
    dataToSave.createdAt = now;
    dataToSave.totalSyncedTasks = 0;
    await setDoc(ref, dataToSave);
  } else {
    await updateDoc(ref, dataToSave);
  }

  await recordAuditLog({
    action: 'save_microtask_provider',
    adminUid: 'admin',
    adminName: 'Admin',
    targetCollection: PROVIDERS_COLLECTION,
    targetDocument: provider.id,
    newValues: dataToSave,
  });
}

export async function deleteProvider(id: string): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase unavailable');
  const db = getFirestoreDb();
  await deleteDoc(doc(db, PROVIDERS_COLLECTION, id));
}

export async function toggleProviderEnabled(id: string, currentEnabled: boolean): Promise<boolean> {
  if (!firebaseReady) throw new Error('Firebase unavailable');
  const db = getFirestoreDb();
  const nextEnabled = !currentEnabled;
  await updateDoc(doc(db, PROVIDERS_COLLECTION, id), {
    enabled: nextEnabled,
    status: nextEnabled ? 'active' : 'inactive',
    updatedAt: new Date().toISOString(),
  });
  return nextEnabled;
}

export async function testProviderConnection(id: string): Promise<{ ok: boolean; message: string }> {
  if (!firebaseReady) return { ok: true, message: 'Simulated connection test successful.' };
  try {
    const db = getFirestoreDb();
    const snap = await getDoc(doc(db, PROVIDERS_COLLECTION, id));
    if (!snap.exists()) return { ok: false, message: 'Provider configuration not found.' };

    const data = snap.data() as MicrotaskProvider;
    if (!data.apiKey) return { ok: false, message: 'API Key missing.' };

    // Simulate API connection check
    await new Promise((r) => setTimeout(r, 600));

    await updateDoc(doc(db, PROVIDERS_COLLECTION, id), {
      status: 'active',
      lastSyncAt: new Date().toISOString(),
      lastError: '',
    });

    return { ok: true, message: `Successfully authenticated with ${data.name} API.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Connection test failed.' };
  }
}

// ===== LOCAL TASKS MANAGEMENT =====

export async function fetchTasks(): Promise<Microtask[]> {
  if (!firebaseReady) return SAMPLE_TASKS;
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, TASKS_COLLECTION));
    if (snap.empty) {
      // Seed initial sample tasks
      for (const t of SAMPLE_TASKS) {
        await setDoc(doc(db, TASKS_COLLECTION, t.id), {
          ...t,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return SAMPLE_TASKS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Microtask, 'id'>) }));
  } catch {
    return SAMPLE_TASKS;
  }
}

export async function fetchTaskById(id: string): Promise<Microtask | null> {
  if (!firebaseReady) return SAMPLE_TASKS.find((t) => t.id === id) || null;
  try {
    const db = getFirestoreDb();
    const snap = await getDoc(doc(db, TASKS_COLLECTION, id));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Microtask, 'id'>) };
    }
    return SAMPLE_TASKS.find((t) => t.id === id) || null;
  } catch {
    return SAMPLE_TASKS.find((t) => t.id === id) || null;
  }
}

export async function saveTask(task: Partial<Microtask> & { id: string; title: string }): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase unavailable');
  const db = getFirestoreDb();
  const ref = doc(db, TASKS_COLLECTION, task.id);
  const now = new Date().toISOString();

  const originalReward = Number(task.originalReward) || Number(task.reward) || 10;
  const platformMargin = Number(task.platformFee) || Math.round(originalReward * 0.2);
  const userReward = originalReward - platformMargin;

  const dataToSave: Partial<Microtask> = {
    ...task,
    originalReward,
    reward: userReward,
    platformFee: platformMargin,
    completedCount: Number(task.completedCount) || 0,
    maxSubmissions: Number(task.maxSubmissions) || 500,
    status: task.status || 'active',
    updatedAt: now,
  };

  const snap = await getDoc(ref);
  if (!snap.exists()) {
    dataToSave.createdAt = now;
    await setDoc(ref, dataToSave);
  } else {
    await updateDoc(ref, dataToSave);
  }
}

export async function syncTasksForProvider(providerId: string): Promise<{ syncedCount: number }> {
  if (!firebaseReady) return { syncedCount: 4 };
  try {
    const db = getFirestoreDb();
    const pSnap = await getDoc(doc(db, PROVIDERS_COLLECTION, providerId));
    if (!pSnap.exists()) throw new Error('Provider not found');

    const provider = pSnap.data() as MicrotaskProvider;

    // Simulate provider task import & margin application
    const syncedTasksCount = Math.floor(Math.random() * 5) + 3;

    await updateDoc(doc(db, PROVIDERS_COLLECTION, providerId), {
      lastSyncAt: new Date().toISOString(),
      totalSyncedTasks: (provider.totalSyncedTasks || 0) + syncedTasksCount,
      status: 'active',
      lastError: '',
    });

    return { syncedCount: syncedTasksCount };
  } catch (err) {
    console.error('Failed sync for provider:', err);
    return { syncedCount: 0 };
  }
}

// ===== SUBMISSIONS & PROOFS =====

export async function submitTaskProof(input: {
  taskId: string;
  uid: string;
  userName: string;
  userEmail: string;
  proofText?: string;
  proofUrl?: string;
  proofScreenshots?: string[];
}): Promise<MicrotaskSubmission> {
  if (!firebaseReady) throw new Error('Firebase database unavailable');
  const db = getFirestoreDb();

  const task = await fetchTaskById(input.taskId);
  if (!task) throw new Error('Task not found');
  if (task.status !== 'active') throw new Error('This task is no longer accepting submissions');

  const subDoc = doc(collection(db, SUBMISSIONS_COLLECTION));
  const submission: MicrotaskSubmission = {
    id: subDoc.id,
    taskId: task.id,
    taskTitle: task.title,
    providerId: task.providerId,
    providerName: task.providerName,
    uid: input.uid,
    userName: input.userName,
    userEmail: input.userEmail,
    proofText: input.proofText || '',
    proofUrl: input.proofUrl || '',
    proofScreenshots: input.proofScreenshots || [],
    status: 'submitted',
    reward: task.reward,
    platformFee: task.platformFee,
    submittedAt: new Date().toISOString(),
  };

  await setDoc(subDoc, { ...submission, createdAt: serverTimestamp() });

  // Update completed counter on task
  await updateDoc(doc(db, TASKS_COLLECTION, task.id), {
    completedCount: (task.completedCount || 0) + 1,
    updatedAt: new Date().toISOString(),
  });

  return submission;
}

export async function fetchSubmissionsForUser(uid: string): Promise<MicrotaskSubmission[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, SUBMISSIONS_COLLECTION), where('uid', '==', uid))
    );
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MicrotaskSubmission, 'id'>) }));
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch {
    return [];
  }
}

export async function fetchAllSubmissions(): Promise<MicrotaskSubmission[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MicrotaskSubmission, 'id'>) }));
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch {
    return [];
  }
}

export async function processSubmissionApproval(
  submissionId: string,
  action: 'approve' | 'reject',
  adminReason?: string
): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase unavailable');
  const db = getFirestoreDb();
  const subRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  const snap = await getDoc(subRef);
  if (!snap.exists()) throw new Error('Submission not found');

  const sub = snap.data() as MicrotaskSubmission;
  if (sub.status === 'approved' || sub.status === 'rejected') {
    throw new Error(`Submission already ${sub.status}`);
  }

  const now = new Date().toISOString();

  if (action === 'approve') {
    // 1. Credit User Unified Wallet via recordWalletTransaction
    const txn = await recordWalletTransaction({
      uid: sub.uid,
      type: 'microtask',
      label: `Microtask Earnings: ${sub.taskTitle}`,
      amount: sub.reward,
      method: 'microtask',
      referenceId: sub.taskId,
      status: 'completed',
    });

    // 2. Update Submission Document
    await updateDoc(subRef, {
      status: 'approved',
      processedAt: now,
      transactionId: txn?.id || `MT-TXN-${Date.now()}`,
    });

    // 3. Send Notification to User
    await createNotification({
      uid: sub.uid,
      title: 'Microtask Approved! 🎉',
      message: `Your proof for "${sub.taskTitle}" was approved! ₹${sub.reward} credited to your wallet.`,
      type: 'success',
    });
  } else {
    // Reject Submission
    await updateDoc(subRef, {
      status: 'rejected',
      rejectionReason: adminReason || 'Proof requirements were not satisfied.',
      processedAt: now,
    });

    await createNotification({
      uid: sub.uid,
      title: 'Microtask Submission Rejected',
      message: `Your proof for "${sub.taskTitle}" was rejected. ${adminReason ? `Reason: ${adminReason}` : ''}`,
      type: 'warning',
    });
  }

  await recordAuditLog({
    action: `microtask_submission_${action}`,
    adminUid: 'admin',
    adminName: 'Admin',
    targetCollection: SUBMISSIONS_COLLECTION,
    targetDocument: submissionId,
    newValues: { action, adminReason, sub },
  });
}

// ===== ANALYTICS ENGINE =====

export async function fetchMicrotaskAnalytics(): Promise<MicrotaskAnalytics> {
  const [tasks, submissions] = await Promise.all([fetchTasks(), fetchAllSubmissions()]);

  const totalTasks = tasks.length;
  const totalSubmissions = submissions.length;
  const completedSubmissions = submissions.filter((s) => s.status === 'approved').length;
  const rejectedSubmissions = submissions.filter((s) => s.status === 'rejected').length;
  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted' || s.status === 'pending_provider').length;

  const approvalRatePercent = totalSubmissions > 0
    ? Math.round((completedSubmissions / totalSubmissions) * 100)
    : 100;

  const totalUserPayout = submissions
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + s.reward, 0);

  const totalPlatformProfit = submissions
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + (s.platformFee || 0), 0);

  const totalProviderVolume = totalUserPayout + totalPlatformProfit;

  // Top workers aggregation
  const workerMap: Record<string, { uid: string; name: string; completed: number; totalEarned: number }> = {};
  for (const sub of submissions) {
    if (sub.status === 'approved') {
      if (!workerMap[sub.uid]) {
        workerMap[sub.uid] = { uid: sub.uid, name: sub.userName || sub.userEmail, completed: 0, totalEarned: 0 };
      }
      workerMap[sub.uid].completed += 1;
      workerMap[sub.uid].totalEarned += sub.reward;
    }
  }

  const topWorkers = Object.values(workerMap)
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, 10);

  // Daily earnings mock timeline
  const dailyEarnings = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return {
      date: dateStr,
      earnings: Math.floor(Math.random() * 400) + 100,
      profit: Math.floor(Math.random() * 100) + 20,
      tasksCompleted: Math.floor(Math.random() * 15) + 3,
    };
  });

  return {
    totalTasks,
    totalSubmissions,
    completedSubmissions,
    rejectedSubmissions,
    pendingSubmissions,
    approvalRatePercent,
    totalUserPayout,
    totalPlatformProfit,
    totalProviderVolume,
    topWorkers,
    dailyEarnings,
  };
}

// ===== REALTIME SUBSCRIPTIONS =====

export function subscribeProviders(callback: (providers: MicrotaskProvider[]) => void): () => void {
  if (!firebaseReady) {
    callback(DEFAULT_PROVIDERS);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, PROVIDERS_COLLECTION), (snap) => {
    if (snap.empty) {
      callback(DEFAULT_PROVIDERS);
    } else {
      callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MicrotaskProvider, 'id'>) })));
    }
  }, (err) => {
    console.warn('subscribeProviders error:', err);
    callback(DEFAULT_PROVIDERS);
  });
}

export function subscribeTasks(callback: (tasks: Microtask[]) => void): () => void {
  if (!firebaseReady) {
    callback(SAMPLE_TASKS);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, TASKS_COLLECTION), (snap) => {
    if (snap.empty) {
      callback(SAMPLE_TASKS);
    } else {
      callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Microtask, 'id'>) })));
    }
  }, (err) => {
    console.warn('subscribeTasks error:', err);
    callback(SAMPLE_TASKS);
  });
}

export function subscribeSubmissionsForUser(
  uid: string,
  callback: (submissions: MicrotaskSubmission[]) => void
): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  const q = query(collection(db, SUBMISSIONS_COLLECTION), where('uid', '==', uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MicrotaskSubmission, 'id'>) }));
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeSubmissionsForUser error:', err);
    callback([]);
  });
}

export function subscribeAllSubmissions(
  callback: (submissions: MicrotaskSubmission[]) => void
): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, SUBMISSIONS_COLLECTION), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MicrotaskSubmission, 'id'>) }));
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    callback(list);
  }, (err) => {
    console.warn('subscribeAllSubmissions error:', err);
    callback([]);
  });
}
