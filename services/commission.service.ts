import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import { fetchPackageById } from '@/services/packages.service';
import { findOrCreateAffiliateByCode, fetchAffiliateStats } from '@/services/affiliate.service';
import { recordWalletTransaction } from '@/services/wallet.service';
import { createNotification } from '@/services/notifications.service';
import { recordAuditLog } from '@/services/audit-log.service';
import type { PackageAffiliateOrder, AffiliateStats } from '@/types';

const PACKAGE_ORDERS_COLLECTION = 'package_affiliate_orders';

export interface CommissionCalculation {
  packageId: string;
  packageName: string;
  price: number;
  commissionRatePercent: number;
  commissionAmount: number;
  flatCommission: number;
  bonusReward: number;
  totalPayout: number;
}

export async function calculatePackageCommission(
  packageId: string,
  priceOverride?: number,
  customAffiliateRate?: number
): Promise<CommissionCalculation> {
  const pkg = await fetchPackageById(packageId);
  const price = priceOverride ?? pkg?.price ?? 0;
  const rate = customAffiliateRate ?? pkg?.affiliateCommissionPercent ?? 10;
  const flat = pkg?.affiliateCommissionFlat ?? 0;
  const bonus = pkg?.bonusReward ?? 0;

  const commissionAmount = Math.round((price * rate) / 100);
  const totalPayout = commissionAmount + flat + bonus;

  return {
    packageId: pkg?.id || packageId,
    packageName: pkg?.name || packageId.toUpperCase(),
    price,
    commissionRatePercent: rate,
    commissionAmount,
    flatCommission: flat,
    bonusReward: bonus,
    totalPayout,
  };
}

export async function processPackageSaleCommission(input: {
  referralCode: string;
  packageId: string;
  orderId: string;
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  priceOverride?: number;
}): Promise<PackageAffiliateOrder | null> {
  if (!firebaseReady || !input.referralCode) return null;

  try {
    const db = getFirestoreDb();
    const cleanCode = input.referralCode.trim().toUpperCase();

    // 1. Locate affiliate record
    const target = await findOrCreateAffiliateByCode(cleanCode);
    if (!target) return null;

    const { ref: affRef, id: referrerUid, data: affData } = target;

    // Prevent self-referral commission
    if (referrerUid === input.buyerUid) {
      console.warn('Self-referral detected. Commission skipped.');
      return null;
    }

    // 2. Fetch package specs & calculate commission
    const calculation = await calculatePackageCommission(input.packageId, input.priceOverride, affData.commissionRate);

    if (calculation.totalPayout <= 0) {
      return null;
    }

    // 3. Create Package Affiliate Order Record
    const orderDoc = doc(collection(db, PACKAGE_ORDERS_COLLECTION));
    const orderRecord: PackageAffiliateOrder = {
      id: orderDoc.id,
      affiliateUid: referrerUid,
      affiliateCode: cleanCode,
      packageId: calculation.packageId,
      packageName: calculation.packageName,
      packagePrice: calculation.price,
      commissionRate: calculation.commissionRatePercent,
      commissionAmount: calculation.commissionAmount,
      bonusAmount: calculation.bonusReward + calculation.flatCommission,
      orderId: input.orderId,
      buyerUid: input.buyerUid,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      purchaseTime: new Date().toISOString(),
      status: 'completed',
    };

    await setDoc(orderDoc, { ...orderRecord, createdAt: serverTimestamp() });

    // 4. Update Affiliate Cumulative Stats
    const updatedSales = (affData.sales || 0) + 1;
    const updatedPending = (affData.pendingCommission || 0) + calculation.totalPayout;
    const updatedBalance = (affData.availableBalance || 0) + calculation.totalPayout;

    await setDoc(
      affRef,
      {
        sales: updatedSales,
        pendingCommission: updatedPending,
        availableBalance: updatedBalance,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 5. Credit Affiliate's Unified Wallet via recordWalletTransaction
    await recordWalletTransaction({
      uid: referrerUid,
      type: 'referral_commission',
      label: `Affiliate Commission (${calculation.commissionRatePercent}% + Bonus) for ${calculation.packageName} - Order #${input.orderId}`,
      amount: calculation.totalPayout,
      method: 'affiliate_package',
      referenceId: input.orderId,
      status: 'completed',
    });

    // 6. Send Notification to Affiliate
    await createNotification({
      uid: referrerUid,
      title: `Package Sale Commission! 💰 (${calculation.packageName})`,
      message: `You earned ₹${calculation.totalPayout.toLocaleString('en-IN')} commission on ${input.buyerName}'s purchase of ${calculation.packageName}.`,
      type: 'success',
    });

    // 7. Record Immutable Audit Log
    await recordAuditLog({
      action: 'package_affiliate_commission_credited',
      adminUid: 'system_affiliate_engine',
      adminName: 'Affiliate Engine',
      targetCollection: 'package_affiliate_orders',
      targetDocument: orderDoc.id,
      newValues: {
        orderRecord,
        totalPayout: calculation.totalPayout,
      },
    });

    return orderRecord;
  } catch (err) {
    console.error('Failed to process package sale commission:', err);
    return null;
  }
}

export async function fetchPackageOrdersForAffiliate(uid: string): Promise<PackageAffiliateOrder[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, PACKAGE_ORDERS_COLLECTION), where('affiliateUid', '==', uid))
    );
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PackageAffiliateOrder, 'id'>) }));
    return list.sort((a, b) => new Date(b.purchaseTime).getTime() - new Date(a.purchaseTime).getTime());
  } catch {
    return [];
  }
}

export async function fetchAllPackageOrders(): Promise<PackageAffiliateOrder[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, PACKAGE_ORDERS_COLLECTION));
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PackageAffiliateOrder, 'id'>) }));
    return list.sort((a, b) => new Date(b.purchaseTime).getTime() - new Date(a.purchaseTime).getTime());
  } catch {
    return [];
  }
}
