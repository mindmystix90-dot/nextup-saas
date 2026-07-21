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
  return uploadFile(`courses/${courseId}/thumbnail.${ext}`, file);
}

export async function uploadCourseBanner(courseId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  return uploadFile(`courses/${courseId}/banner.${ext}`, file);
}

export async function uploadCourseVideo(courseId: string, lessonId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  return uploadFile(`courses/${courseId}/videos/${lessonId}.${ext}`, file);
}

export async function uploadCoursePdf(courseId: string, resourceId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  return uploadFile(`courses/${courseId}/pdfs/${resourceId}.${ext}`, file);
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  return uploadFile(`avatars/${uid}.${ext}`, file);
}

export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  return uploadFile(`cms/logo.${ext}`, file);
}
