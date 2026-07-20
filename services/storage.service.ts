import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getFirebaseStorage, firebaseReady } from '@/lib/firebase';

export async function uploadFile(path: string, file: File): Promise<string> {
  if (!firebaseReady) throw new Error('Firebase is not configured.');
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadCourseImage(courseId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  return uploadFile(`courses/${courseId}/image.${ext}`, file);
}

export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  return uploadFile(`cms/logo.${ext}`, file);
}
