/**
 * Local photo storage for students using IndexedDB.
 * Photos are stored LOCALLY ONLY and will be lost if the app/browser data is cleared.
 */

const DB_NAME = "kinder_bh_photos";
const DB_VERSION = 1;
const STORE_NAME = "student_photos";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface LocalPhoto {
  id: string; // `${studentId}_${timestamp}`
  studentId: string;
  dataUrl: string; // base64 image
  createdAt: string;
  caption?: string;
}

export async function saveStudentPhoto(studentId: string, file: File, caption?: string): Promise<LocalPhoto> {
  const db = await openDB();
  const dataUrl = await fileToDataUrl(file);
  const photo: LocalPhoto = {
    id: `${studentId}_${Date.now()}`,
    studentId,
    dataUrl,
    createdAt: new Date().toISOString(),
    caption,
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(photo);
    tx.oncomplete = () => resolve(photo);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getStudentPhotos(studentId: string): Promise<LocalPhoto[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as LocalPhoto[];
      resolve(all.filter(p => p.studentId === studentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteStudentPhoto(photoId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(photoId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
