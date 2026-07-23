import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb, firebaseReady } from '@/lib/firebase';
import { createCertificate } from '@/services/certificates.service';
import type {
  Lesson,
  StudentBookmark,
  StudentNote,
  LessonDiscussion,
  CourseProgressRecord,
} from '@/types';

const LESSONS_COLLECTION = 'lessons';
const LESSON_PROGRESS_COLLECTION = 'lessonProgress';
const COURSE_PROGRESS_COLLECTION = 'courseProgress';
const BOOKMARKS_COLLECTION = 'studentBookmarks';
const NOTES_COLLECTION = 'studentNotes';
const DISCUSSIONS_COLLECTION = 'lessonDiscussions';

// Sample default structured lessons for courses without custom published lessons
export function getDefaultLessonsForCourse(courseId: string, courseTitle: string): Lesson[] {
  return [
    {
      id: `${courseId}-l1`,
      courseId,
      title: 'Module 1: Introduction & Environment Setup',
      description: 'Overview of the course, architectural concepts, tools installation and workspace configuration.',
      duration: '14 mins',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      sortOrder: 1,
      isFreePreview: true,
    },
    {
      id: `${courseId}-l2`,
      courseId,
      title: 'Module 2: Core Concepts & Principles',
      description: 'In-depth exploration of core building blocks, data structures, and best practices.',
      duration: '22 mins',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      sortOrder: 2,
    },
    {
      id: `${courseId}-l3`,
      courseId,
      title: 'Module 3: Hands-On Reference Guide & Architecture PDF',
      description: 'Comprehensive study guide, schematics, and architecture cheatsheet PDF.',
      duration: '10 mins read',
      type: 'pdf',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      sortOrder: 3,
    },
    {
      id: `${courseId}-l4`,
      courseId,
      title: 'Module 4: Project Source Code & Starter Kit',
      description: 'Downloadable zip archive with complete boilerplate, assets, and configuration scripts.',
      duration: '5 mins',
      type: 'download',
      downloadUrl: '#',
      downloadName: `${courseTitle.toLowerCase().replace(/\s+/g, '-')}-starter-code.zip`,
      sortOrder: 4,
    },
    {
      id: `${courseId}-l5`,
      courseId,
      title: 'Module 5: Real-World Case Study & Deployment',
      description: 'Step-by-step production setup, optimization techniques, and deployment workflow.',
      duration: '35 mins',
      type: 'video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      sortOrder: 5,
    },
  ];
}

export async function fetchCourseLessons(courseId: string): Promise<Lesson[]> {
  if (!firebaseReady) return getDefaultLessonsForCourse(courseId, 'Course');
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(collection(db, LESSONS_COLLECTION), where('courseId', '==', courseId))
    );
    if (snap.empty) {
      return getDefaultLessonsForCourse(courseId, 'Course');
    }
    const lessons = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lesson, 'id'>) }));
    return lessons.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return getDefaultLessonsForCourse(courseId, 'Course');
  }
}

// ===== Lesson Progress & Course Progress =====

export async function fetchCompletedLessonIds(uid: string, courseId: string): Promise<string[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(
        collection(db, LESSON_PROGRESS_COLLECTION),
        where('uid', '==', uid),
        where('courseId', '==', courseId),
        where('completed', '==', true)
      )
    );
    return snap.docs.map((d) => (d.data() as { lessonId: string }).lessonId);
  } catch {
    return [];
  }
}

export async function toggleLessonCompletion(
  uid: string,
  courseId: string,
  lessonId: string,
  totalLessons: number,
  courseTitle: string,
  studentName: string
): Promise<{ completedLessons: string[]; progressPercent: number; isCourseCompleted: boolean }> {
  let completed = await fetchCompletedLessonIds(uid, courseId);
  const isCompletedNow = !completed.includes(lessonId);

  if (isCompletedNow) {
    completed = [...completed, lessonId];
  } else {
    completed = completed.filter((id) => id !== lessonId);
  }

  const progressPercent = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0;
  const isCourseCompleted = progressPercent === 100;
  const docId = `${uid}_${courseId}_${lessonId}`;
  const courseProgDocId = `${uid}_${courseId}`;

  if (firebaseReady) {
    try {
      const db = getFirestoreDb();
      
      // Update individual lesson record
      await setDoc(doc(db, LESSON_PROGRESS_COLLECTION, docId), {
        uid,
        courseId,
        lessonId,
        completed: isCompletedNow,
        updatedAt: serverTimestamp(),
      });

      // Update aggregate course progress record
      const courseProgData: CourseProgressRecord = {
        uid,
        courseId,
        courseTitle,
        progress: progressPercent,
        completedLessons: completed.length,
        totalLessons,
        status: progressPercent === 100 ? 'completed' : progressPercent > 0 ? 'in-progress' : 'not-started',
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, COURSE_PROGRESS_COLLECTION, courseProgDocId), {
        ...courseProgData,
        updatedAt: serverTimestamp(),
      });

      // If course is 100% complete, automatically issue a verifiable certificate!
      if (isCourseCompleted) {
        await createCertificate({
          recipientName: studentName || 'Learner',
          recipientUid: uid,
          courseName: courseTitle,
          courseId,
          instructor: 'NextUp Academy',
          issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          grade: 'A+',
          gradient: 'from-amber-500 to-orange-600',
          icon: 'Award',
          status: 'issued',
        });
      }
    } catch (e) {
      console.warn('Firestore progress write warning:', e);
    }
  }

  return { completedLessons: completed, progressPercent, isCourseCompleted };
}

// ===== Bookmarks =====

export async function fetchUserBookmarks(uid: string, courseId?: string): Promise<StudentBookmark[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    let q = query(collection(db, BOOKMARKS_COLLECTION), where('uid', '==', uid));
    if (courseId) {
      q = query(collection(db, BOOKMARKS_COLLECTION), where('uid', '==', uid), where('courseId', '==', courseId));
    }
    const snap = await getDocs(q);
    const bookmarks = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StudentBookmark, 'id'>) }));
    return bookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function addBookmark(input: Omit<StudentBookmark, 'id' | 'createdAt'>): Promise<StudentBookmark> {
  const ref = doc(collection(getFirestoreDb(), BOOKMARKS_COLLECTION));
  const newBookmark: StudentBookmark = {
    id: ref.id,
    ...input,
    createdAt: new Date().toISOString(),
  };
  if (firebaseReady) {
    await setDoc(ref, { ...newBookmark, createdAt: serverTimestamp() });
  }
  return newBookmark;
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
  if (firebaseReady) {
    await deleteDoc(doc(getFirestoreDb(), BOOKMARKS_COLLECTION, bookmarkId));
  }
}

// ===== Notes =====

export async function fetchUserNotes(uid: string, courseId?: string): Promise<StudentNote[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    let q = query(collection(db, NOTES_COLLECTION), where('uid', '==', uid));
    if (courseId) {
      q = query(collection(db, NOTES_COLLECTION), where('uid', '==', uid), where('courseId', '==', courseId));
    }
    const snap = await getDocs(q);
    const notes = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StudentNote, 'id'>) }));
    return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function saveNote(input: Omit<StudentNote, 'id' | 'createdAt'> & { id?: string }): Promise<StudentNote> {
  const db = getFirestoreDb();
  const ref = input.id ? doc(db, NOTES_COLLECTION, input.id) : doc(collection(db, NOTES_COLLECTION));
  const note: StudentNote = {
    id: ref.id,
    uid: input.uid,
    courseId: input.courseId,
    lessonId: input.lessonId,
    lessonTitle: input.lessonTitle,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
  if (firebaseReady) {
    await setDoc(ref, { ...note, createdAt: serverTimestamp() });
  }
  return note;
}

export async function deleteNote(noteId: string): Promise<void> {
  if (firebaseReady) {
    await deleteDoc(doc(getFirestoreDb(), NOTES_COLLECTION, noteId));
  }
}

// ===== Lesson Discussions / Q&A =====

export async function fetchLessonDiscussions(courseId: string, lessonId: string): Promise<LessonDiscussion[]> {
  if (!firebaseReady) return [];
  try {
    const db = getFirestoreDb();
    const snap = await getDocs(
      query(
        collection(db, DISCUSSIONS_COLLECTION),
        where('courseId', '==', courseId),
        where('lessonId', '==', lessonId)
      )
    );
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LessonDiscussion, 'id'>) }));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function postLessonDiscussion(input: Omit<LessonDiscussion, 'id' | 'createdAt'>): Promise<LessonDiscussion> {
  const ref = doc(collection(getFirestoreDb(), DISCUSSIONS_COLLECTION));
  const discussion: LessonDiscussion = {
    id: ref.id,
    ...input,
    createdAt: new Date().toISOString(),
    replies: [],
  };
  if (firebaseReady) {
    await setDoc(ref, { ...discussion, createdAt: serverTimestamp() });
  }
  return discussion;
}
