import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { GlobalWithdrawalSettings } from '@/types';
import { logAdminAction } from '@/services/audit-log.service';

export const DEFAULT_WITHDRAWAL_SETTINGS: GlobalWithdrawalSettings = {
  withdrawalsEnabled: true,
  maintenanceMode: false,
  globalMinimumWithdrawal: 500,
  globalMaximumWithdrawal: 50000,
  dailyWithdrawalLimit: 100000,
  weeklyWithdrawalLimit: 500000,
  maximumPendingWithdrawals: 3,
  withdrawalCooldownHours: 24,
  requireKYC: true,
  autoApprove: false,
  allowWeekendWithdrawals: true,
  allowHolidayWithdrawals: true,
  adminMessage: 'Withdrawal system is operational.',
};

let cachedSettings: GlobalWithdrawalSettings | null = null;

export async function fetchWithdrawalSettings(): Promise<GlobalWithdrawalSettings> {
  if (cachedSettings) return cachedSettings;
  if (!firebaseReady) return DEFAULT_WITHDRAWAL_SETTINGS;

  try {
    const db = getFirestoreDb();
    const snap = await getDoc(doc(db, 'system_settings', 'platform'));
    if (snap.exists() && snap.data().withdrawalSettings) {
      cachedSettings = { ...DEFAULT_WITHDRAWAL_SETTINGS, ...snap.data().withdrawalSettings };
    } else {
      cachedSettings = DEFAULT_WITHDRAWAL_SETTINGS;
    }
    return cachedSettings || DEFAULT_WITHDRAWAL_SETTINGS;
  } catch {
    return DEFAULT_WITHDRAWAL_SETTINGS;
  }
}

export function subscribeWithdrawalSettings(
  callback: (settings: GlobalWithdrawalSettings) => void
): () => void {
  if (!firebaseReady) {
    callback(DEFAULT_WITHDRAWAL_SETTINGS);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(
    doc(db, 'system_settings', 'platform'),
    (snap) => {
      if (snap.exists() && snap.data().withdrawalSettings) {
        const merged = { ...DEFAULT_WITHDRAWAL_SETTINGS, ...snap.data().withdrawalSettings };
        cachedSettings = merged;
        callback(merged);
      } else {
        callback(DEFAULT_WITHDRAWAL_SETTINGS);
      }
    },
    () => callback(DEFAULT_WITHDRAWAL_SETTINGS)
  );
}

export async function updateWithdrawalSettings(
  newSettings: Partial<GlobalWithdrawalSettings>,
  adminInfo?: { uid: string; name: string }
): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not ready');

  const current = await fetchWithdrawalSettings();
  const updated: GlobalWithdrawalSettings = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString(),
  };

  const db = getFirestoreDb();
  await setDoc(
    doc(db, 'system_settings', 'platform'),
    {
      withdrawalSettings: updated,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  cachedSettings = updated;

  if (adminInfo) {
    await logAdminAction({
      adminUid: adminInfo.uid,
      adminName: adminInfo.name,
      action: 'Withdrawal Settings Updated',
      targetCollection: 'system_settings',
      targetDocument: 'platform',
      oldValues: current,
      newValues: updated,
    });
  }
}
