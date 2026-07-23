import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface LeadNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface LeadTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  assignedTo?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: LeadStage;
  value: number; // Potential deal size in INR
  source: 'website' | 'referral' | 'campaign' | 'direct' | 'manual';
  salesPartnerId?: string;
  salesPartnerName?: string;
  notes: LeadNote[];
  tasks: LeadTask[];
  tags: string[];
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const LEADS_COLLECTION = 'crm_leads';

export async function fetchLeads(): Promise<Lead[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, LEADS_COLLECTION), orderBy('updatedAt', 'desc'))
    );
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || 'Unnamed Lead',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        stage: data.stage || 'new',
        value: data.value || 0,
        source: data.source || 'website',
        notes: data.notes || [],
        tasks: data.tasks || [],
        tags: data.tags || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    });
  } catch (e) {
    console.warn('Failed to fetch CRM leads:', e);
    return [];
  }
}

export async function createLead(input: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'tasks'>): Promise<Lead> {
  const db = firebaseReady ? getFirestoreDb() : null;
  const docRef = db ? doc(collection(db, LEADS_COLLECTION)) : { id: 'lead-' + Date.now() };
  const now = new Date().toISOString();

  const newLead: Lead = {
    id: docRef.id,
    ...input,
    notes: [],
    tasks: [],
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    await setDoc(doc(db, LEADS_COLLECTION, docRef.id), {
      ...newLead,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return newLead;
}

export async function updateLeadStage(id: string, stage: LeadStage): Promise<void> {
  if (!firebaseReady) return;
  const db = getFirestoreDb();
  await updateDoc(doc(db, LEADS_COLLECTION, id), {
    stage,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateLeadDetails(id: string, details: Partial<Lead>): Promise<void> {
  if (!firebaseReady) return;
  const db = getFirestoreDb();
  await updateDoc(doc(db, LEADS_COLLECTION, id), {
    ...details,
    updatedAt: new Date().toISOString(),
  });
}

export async function addLeadNote(leadId: string, author: string, content: string): Promise<LeadNote> {
  const note: LeadNote = {
    id: 'note-' + Date.now(),
    author,
    content,
    createdAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    const db = getFirestoreDb();
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    const snap = await getDoc(leadRef);
    if (snap.exists()) {
      const currentNotes = snap.data().notes || [];
      await updateDoc(leadRef, {
        notes: [note, ...currentNotes],
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return note;
}

export async function addLeadTask(leadId: string, title: string, dueDate: string, assignedTo?: string): Promise<LeadTask> {
  const task: LeadTask = {
    id: 'task-' + Date.now(),
    title,
    dueDate,
    completed: false,
    assignedTo,
    createdAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    const db = getFirestoreDb();
    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    const snap = await getDoc(leadRef);
    if (snap.exists()) {
      const currentTasks = snap.data().tasks || [];
      await updateDoc(leadRef, {
        tasks: [...currentTasks, task],
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return task;
}

export async function toggleLeadTask(leadId: string, taskId: string, completed: boolean): Promise<void> {
  if (!firebaseReady) return;
  const db = getFirestoreDb();
  const leadRef = doc(db, LEADS_COLLECTION, leadId);
  const snap = await getDoc(leadRef);
  if (snap.exists()) {
    const tasks: LeadTask[] = snap.data().tasks || [];
    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, completed } : t));
    await updateDoc(leadRef, {
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function deleteLead(id: string): Promise<void> {
  if (!firebaseReady) return;
  const db = getFirestoreDb();
  await deleteDoc(doc(db, LEADS_COLLECTION, id));
}
