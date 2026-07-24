'use client';

import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { SystemSettings } from '@/types';

export type { SystemSettings };

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  walletEnabled: true,

  rewards: {
    referralSignupBonus: 100,
    affiliatePurchasePercent: 10,
    dailyReward: 5,
  },

  withdrawals: {
    minimumWithdraw: 500,
    maximumWithdraw: 10000,
    withdrawalFee: 2,
    withdrawalFeeType: 'percentage',
    autoApprove: false,
  },

  affiliate: {
    enabled: true,
    cookieDurationDays: 30,
    attribution: 'first_click',
    commissionPercent: 10,
  },

  microtasks: {
    enabled: true,
    minimumWithdraw: 500,
    profitMarginPercent: 20,
    defaultPendingDays: 3,
  },
};

let cachedSettings: SystemSettings | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds cache

export async function fetchSystemSettings(): Promise<SystemSettings> {
  const now = Date.now();
  if (cachedSettings && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  if (!firebaseReady) {
    return DEFAULT_SYSTEM_SETTINGS;
  }

  try {
    const db = getFirestoreDb();
    const ref = doc(db, 'system_settings', 'platform');
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      cachedSettings = mergeWithDefaults(data);
    } else {
      cachedSettings = DEFAULT_SYSTEM_SETTINGS;
      await setDoc(ref, {
        ...DEFAULT_SYSTEM_SETTINGS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    lastFetchTime = Date.now();
    return cachedSettings;
  } catch (error) {
    console.warn('Error fetching system settings, using defaults:', error);
    return cachedSettings || DEFAULT_SYSTEM_SETTINGS;
  }
}

export function subscribeSystemSettings(callback: (settings: SystemSettings) => void): () => void {
  if (!firebaseReady) {
    callback(DEFAULT_SYSTEM_SETTINGS);
    return () => {};
  }

  try {
    const db = getFirestoreDb();
    const ref = doc(db, 'system_settings', 'platform');
    return onSnapshot(
      ref,
      async (snap) => {
        if (snap.exists()) {
          const merged = mergeWithDefaults(snap.data());
          cachedSettings = merged;
          lastFetchTime = Date.now();
          callback(merged);
        } else {
          const def = DEFAULT_SYSTEM_SETTINGS;
          cachedSettings = def;
          lastFetchTime = Date.now();
          try {
            await setDoc(ref, {
              ...def,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch { /* best effort */ }
          callback(def);
        }
      },
      (err) => {
        console.warn('System settings listener error:', err);
        callback(cachedSettings || DEFAULT_SYSTEM_SETTINGS);
      }
    );
  } catch {
    callback(DEFAULT_SYSTEM_SETTINGS);
    return () => {};
  }
}

export async function updateSystemSettings(newSettings: Partial<SystemSettings>): Promise<void> {
  if (!firebaseReady) throw new Error('Firebase is not ready');

  const db = getFirestoreDb();
  const ref = doc(db, 'system_settings', 'platform');
  const current = await fetchSystemSettings();

  const updated: SystemSettings = {
    ...current,
    ...newSettings,
    rewards: { ...current.rewards, ...(newSettings.rewards || {}) },
    withdrawals: { ...current.withdrawals, ...(newSettings.withdrawals || {}) },
    affiliate: { ...current.affiliate, ...(newSettings.affiliate || {}) },
    microtasks: { ...current.microtasks, ...(newSettings.microtasks || {}) },
  };

  await setDoc(ref, {
    ...updated,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  cachedSettings = updated;
  lastFetchTime = Date.now();
}

function mergeWithDefaults(raw: any): SystemSettings {
  return {
    walletEnabled: raw.walletEnabled ?? DEFAULT_SYSTEM_SETTINGS.walletEnabled,
    rewards: {
      referralSignupBonus: Number(raw.rewards?.referralSignupBonus ?? DEFAULT_SYSTEM_SETTINGS.rewards.referralSignupBonus),
      affiliatePurchasePercent: Number(raw.rewards?.affiliatePurchasePercent ?? DEFAULT_SYSTEM_SETTINGS.rewards.affiliatePurchasePercent),
      dailyReward: Number(raw.rewards?.dailyReward ?? DEFAULT_SYSTEM_SETTINGS.rewards.dailyReward),
    },
    withdrawals: {
      minimumWithdraw: Number(raw.withdrawals?.minimumWithdraw ?? DEFAULT_SYSTEM_SETTINGS.withdrawals.minimumWithdraw),
      maximumWithdraw: Number(raw.withdrawals?.maximumWithdraw ?? DEFAULT_SYSTEM_SETTINGS.withdrawals.maximumWithdraw),
      withdrawalFee: Number(raw.withdrawals?.withdrawalFee ?? DEFAULT_SYSTEM_SETTINGS.withdrawals.withdrawalFee),
      withdrawalFeeType: raw.withdrawals?.withdrawalFeeType ?? DEFAULT_SYSTEM_SETTINGS.withdrawals.withdrawalFeeType,
      autoApprove: Boolean(raw.withdrawals?.autoApprove ?? DEFAULT_SYSTEM_SETTINGS.withdrawals.autoApprove),
    },
    affiliate: {
      enabled: Boolean(raw.affiliate?.enabled ?? DEFAULT_SYSTEM_SETTINGS.affiliate.enabled),
      cookieDurationDays: Number(raw.affiliate?.cookieDurationDays ?? DEFAULT_SYSTEM_SETTINGS.affiliate.cookieDurationDays),
      attribution: raw.affiliate?.attribution ?? DEFAULT_SYSTEM_SETTINGS.affiliate.attribution,
      commissionPercent: Number(raw.affiliate?.commissionPercent ?? DEFAULT_SYSTEM_SETTINGS.affiliate.commissionPercent),
    },
    microtasks: {
      enabled: Boolean(raw.microtasks?.enabled ?? DEFAULT_SYSTEM_SETTINGS.microtasks.enabled),
      minimumWithdraw: Number(raw.microtasks?.minimumWithdraw ?? DEFAULT_SYSTEM_SETTINGS.microtasks.minimumWithdraw),
      profitMarginPercent: Number(raw.microtasks?.profitMarginPercent ?? DEFAULT_SYSTEM_SETTINGS.microtasks.profitMarginPercent),
      defaultPendingDays: Number(raw.microtasks?.defaultPendingDays ?? DEFAULT_SYSTEM_SETTINGS.microtasks.defaultPendingDays),
    },
  };
}
