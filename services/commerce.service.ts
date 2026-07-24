import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import { generateOrderId, generatePaymentId, generateInvoiceId } from '@/lib/id-generator';
import { recordAffiliatePurchase } from '@/services/affiliate.service';
import { processPackageSaleCommission } from '@/services/commission.service';
import { logAdminAction } from '@/services/audit.service';
import { sendEmailNotification } from '@/services/email.service';
import type { Order, Payment, Invoice, Membership, ActivityLog, NotificationItem } from '@/types';

const ORDERS_COLLECTION = 'orders';
const PAYMENTS_COLLECTION = 'payments';
const INVOICES_COLLECTION = 'invoices';
const ACTIVITY_LOGS_COLLECTION = 'activityLogs';
const NOTIFICATIONS_COLLECTION = 'notifications';

export interface CreateOrderInput {
  uid: string;
  userName: string;
  userEmail: string;
  packageId?: string;
  packageName: string;
  courseId?: string;
  amount: number;
  discountAmount?: number;
  couponCode?: string;
  paymentMethod?: string;
  paymentProofRef?: string;
  paymentProofNotes?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const orderId = generateOrderId();
  const taxAmount = Math.round(input.amount * 0.18); // 18% GST standard
  const totalAmount = input.amount;

  const orderData: Order = {
    id: orderId,
    uid: input.uid,
    userName: input.userName,
    userEmail: input.userEmail,
    packageId: input.packageId || 'custom',
    packageName: input.packageName,
    courseId: input.courseId || '',
    amount: input.amount,
    discountAmount: input.discountAmount || 0,
    taxAmount,
    totalAmount,
    status: 'pending',
    couponCode: input.couponCode || '',
    paymentMethod: input.paymentMethod || 'bank_transfer',
    paymentProofRef: input.paymentProofRef || '',
    paymentProofNotes: input.paymentProofNotes || '',
    createdAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    try {
      const db = getFirestoreDb();
      await setDoc(doc(db, ORDERS_COLLECTION, orderId), {
        ...orderData,
        createdAt: serverTimestamp(),
      });

      // Send initial payment request email
      await sendEmailNotification({
        to: input.userEmail,
        subject: `Payment Request Submitted — ${orderId}`,
        template: 'payment_pending',
        data: { orderId, packageName: input.packageName, amount: totalAmount },
      });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  }

  return orderData;
}

/**
 * MANUAL PAYMENT APPROVAL BY ADMIN
 * Complete automated workflow:
 * 1. Mark Order Completed
 * 2. Create Payment Record
 * 3. Generate Invoice
 * 4. Activate User Membership
 * 5. Unlock Course Access if applicable
 * 6. Create Activity Log & Audit Log
 * 7. Notify User via In-App & Email
 * 8. Credit Affiliate / Sales Partner Commission & Notify
 */
export async function approveManualPayment(orderId: string, adminUid: string = 'admin'): Promise<{
  order: Order;
  payment: Payment;
  invoice: Invoice;
}> {
  if (!firebaseReady) {
    throw new Error('Firebase database is not connected.');
  }

  const db = getFirestoreDb();
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snap = await getDoc(orderRef);

  if (!snap.exists()) {
    throw new Error(`Order ${orderId} not found.`);
  }

  const order = { id: snap.id, ...(snap.data() as Omit<Order, 'id'>) };

  if (order.status === 'completed') {
    throw new Error(`Order ${orderId} has already been approved.`);
  }

  const paymentId = generatePaymentId();
  const invoiceId = generateInvoiceId();
  const nowIso = new Date().toISOString();

  // 1. Create Payment
  const payment: Payment = {
    id: paymentId,
    uid: order.uid,
    userName: order.userName,
    userEmail: order.userEmail,
    type: order.courseId ? 'course' : 'membership',
    itemName: order.packageName,
    itemId: order.packageId || order.courseId,
    amount: order.totalAmount,
    status: 'completed',
    method: (order.paymentMethod as any) || 'bank_transfer',
    invoiceId,
    date: nowIso.split('T')[0],
  };

  // 2. Create Invoice
  const invoice: Invoice = {
    id: invoiceId,
    orderId: order.id,
    paymentId,
    uid: order.uid,
    userName: order.userName,
    userEmail: order.userEmail,
    itemName: order.packageName,
    amount: order.amount,
    taxAmount: order.taxAmount || Math.round(order.amount * 0.18),
    totalAmount: order.totalAmount,
    status: 'paid',
    createdAt: nowIso,
  };

  // Update Order
  order.status = 'completed';
  order.paymentId = paymentId;
  order.invoiceId = invoiceId;

  await updateDoc(orderRef, {
    status: 'completed',
    paymentId,
    invoiceId,
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Save Payment and Invoice
  await setDoc(doc(db, PAYMENTS_COLLECTION, paymentId), { ...payment, createdAt: serverTimestamp() });
  await setDoc(doc(db, INVOICES_COLLECTION, invoiceId), { ...invoice, createdAt: serverTimestamp() });

  // 3. Activate Membership on User Profile
  let targetMembership: Membership = 'pro';
  const pkgLower = (order.packageId || order.packageName).toLowerCase();
  if (pkgLower.includes('lifetime')) {
    targetMembership = 'lifetime';
  } else if (pkgLower.includes('starter')) {
    targetMembership = 'starter';
  } else {
    targetMembership = 'pro';
  }

  await setDoc(
    doc(db, 'users', order.uid),
    {
      membership: targetMembership,
      membershipStatus: 'active',
      membershipStart: nowIso,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Unlock Course if course purchase
  if (order.courseId) {
    await setDoc(
      doc(db, 'course_access', `${order.uid}_${order.courseId}`),
      {
        uid: order.uid,
        courseId: order.courseId,
        grantedAt: nowIso,
        grantedBy: 'purchase',
      },
      { merge: true }
    );
  }

  // 4. Activity Log & Audit Log
  const actDoc = doc(collection(db, ACTIVITY_LOGS_COLLECTION));
  await setDoc(actDoc, {
    id: actDoc.id,
    uid: order.uid,
    userName: order.userName,
    userEmail: order.userEmail,
    type: 'purchase',
    message: `Manual Payment Approved: ${order.packageName} (Order ${order.id}) for ₹${order.totalAmount.toLocaleString('en-IN')}`,
    createdAt: nowIso,
  });

  await logAdminAction({
    adminUid,
    adminEmail: 'admin@nextup.com',
    action: 'APPROVE_MANUAL_PAYMENT',
    targetCollection: 'orders',
    targetDocId: orderId,
    details: { orderId, amount: order.totalAmount, userEmail: order.userEmail },
  });

  // 5. In-App Notification & Email to User
  const notifDoc = doc(collection(db, NOTIFICATIONS_COLLECTION));
  await setDoc(notifDoc, {
    id: notifDoc.id,
    title: 'Payment Approved! 🎉',
    message: `Your payment for ${order.packageName} (Order: ${order.id}) has been verified and approved. Access activated!`,
    targetRole: 'student',
    targetUid: order.uid,
    type: 'success',
    createdAt: nowIso,
  });

  await sendEmailNotification({
    to: order.userEmail,
    subject: `Payment Approved — ${order.packageName} Activated!`,
    template: 'payment_approved',
    data: { orderId: order.id, packageName: order.packageName, invoiceId },
  });

  // 6. Affiliate / Sales Partner Commission Attribution
  const userDoc = await getDoc(doc(db, 'users', order.uid));
  const referredByCode = userDoc.exists() ? userDoc.data().referredByCode : null;
  const referredByUid = userDoc.exists() ? userDoc.data().referredByUid : null;
  const affiliateIdentifier = referredByUid || referredByCode || order.couponCode;

  if (affiliateIdentifier) {
    if (order.packageId) {
      await processPackageSaleCommission({
        referralCode: referredByCode || affiliateIdentifier,
        packageId: order.packageId,
        orderId: order.id,
        buyerUid: order.uid,
        buyerName: order.userName,
        buyerEmail: order.userEmail,
        priceOverride: order.totalAmount,
      });
    } else {
      const res = await recordAffiliatePurchase(affiliateIdentifier, order.totalAmount, order.id);
      if (res) {
        console.log(`[Affiliate Attribution] Credited ₹${res.commissionAmount} to affiliate ${res.referrerUid}`);
      }
    }
  }

  return { order, payment, invoice };
}

export async function rejectManualPayment(orderId: string, reason: string, adminUid: string = 'admin'): Promise<void> {
  if (!firebaseReady) return;
  const db = getFirestoreDb();
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snap = await getDoc(orderRef);

  if (snap.exists()) {
    const order = snap.data();
    await updateDoc(orderRef, {
      status: 'failed',
      rejectionReason: reason,
      rejectedBy: adminUid,
      updatedAt: serverTimestamp(),
    });

    await logAdminAction({
      adminUid,
      adminEmail: 'admin@nextup.com',
      action: 'REJECT_MANUAL_PAYMENT',
      targetCollection: 'orders',
      targetDocId: orderId,
      details: { orderId, reason },
    });

    const notifDoc = doc(collection(db, NOTIFICATIONS_COLLECTION));
    await setDoc(notifDoc, {
      id: notifDoc.id,
      title: 'Payment Approval Declined',
      message: `Your payment proof for order ${orderId} could not be verified: ${reason}. Please contact support.`,
      targetRole: 'student',
      targetUid: order.uid,
      type: 'warning',
      createdAt: new Date().toISOString(),
    });
  }
}

// ===== Data Retrieval Methods =====

export async function fetchUserOrders(uid: string): Promise<Order[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, ORDERS_COLLECTION), where('uid', '==', uid))
    );
    const orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function fetchUserPayments(uid: string): Promise<Payment[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, PAYMENTS_COLLECTION), where('uid', '==', uid))
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }));
  } catch {
    return [];
  }
}

export async function fetchUserInvoices(uid: string): Promise<Invoice[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, INVOICES_COLLECTION), where('uid', '==', uid))
    );
    const invoices = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Invoice, 'id'>) }));
    return invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function fetchInvoiceById(invoiceId: string): Promise<Invoice | null> {
  if (!firebaseReady) return null;
  try {
    const db = getFirestoreDb();
    const snap = await getDoc(doc(db, INVOICES_COLLECTION, invoiceId));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Invoice, 'id'>) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    const orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

// ===== REALTIME SUBSCRIPTIONS =====

export function subscribeUserOrders(uid: string, callback: (orders: Order[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  const q = query(collection(db, ORDERS_COLLECTION), where('uid', '==', uid));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(orders);
  }, (err) => {
    console.warn('subscribeUserOrders error:', err);
    callback([]);
  });
}

export function subscribeAllOrders(callback: (orders: Order[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  return onSnapshot(collection(db, ORDERS_COLLECTION), (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(orders);
  }, (err) => {
    console.warn('subscribeAllOrders error:', err);
    callback([]);
  });
}

export function subscribeUserPayments(uid: string, callback: (payments: Payment[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  const q = query(collection(db, PAYMENTS_COLLECTION), where('uid', '==', uid));
  return onSnapshot(q, (snap) => {
    const payments = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }));
    callback(payments);
  }, (err) => {
    console.warn('subscribeUserPayments error:', err);
    callback([]);
  });
}

export function subscribeUserInvoices(uid: string, callback: (invoices: Invoice[]) => void): () => void {
  if (!firebaseReady) {
    callback([]);
    return () => {};
  }

  const db = getFirestoreDb();
  const q = query(collection(db, INVOICES_COLLECTION), where('uid', '==', uid));
  return onSnapshot(q, (snap) => {
    const invoices = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Invoice, 'id'>) }));
    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(invoices);
  }, (err) => {
    console.warn('subscribeUserInvoices error:', err);
    callback([]);
  });
}
