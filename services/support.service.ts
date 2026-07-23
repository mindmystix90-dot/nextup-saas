import {
  collection, deleteDoc, doc, getDocs, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import type { SupportTicket, SupportTicketReply } from '@/types';

const TICKETS_COLLECTION = 'support_tickets';

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, TICKETS_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SupportTicket, 'id'>) }));
  } catch {
    return [];
  }
}

export async function addTicketReply(ticketId: string, reply: Omit<SupportTicketReply, 'id' | 'createdAt'>): Promise<SupportTicketReply> {
  const newReply: SupportTicketReply = {
    id: `R-${Date.now().toString().slice(-4)}`,
    ...reply,
    createdAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    try {
      const db = getFirestoreDb();
      const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
      // Fetch current replies and append
      const snap = await getDocs(collection(db, TICKETS_COLLECTION));
      const ticket = snap.docs.find((d) => d.id === ticketId);
      if (ticket) {
        const existingReplies = ticket.data().replies || [];
        await updateDoc(ticketRef, {
          replies: [...existingReplies, newReply],
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn('Firestore reply failed:', e);
    }
  }

  return newReply;
}

export async function updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore ticket status update failed:', e);
  }
}

export async function deleteTicket(ticketId: string): Promise<void> {
  if (!firebaseReady) return;
  try {
    const db = getFirestoreDb();
    await deleteDoc(doc(db, TICKETS_COLLECTION, ticketId));
  } catch (e) {
    console.warn('Firestore ticket delete failed:', e);
  }
}
