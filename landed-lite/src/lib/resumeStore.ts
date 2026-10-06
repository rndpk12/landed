import type { LiteResume } from '../types/resume';

const DATABASE_NAME = 'landed-lite-resumes';
const STORE_NAME = 'resumes';

const createId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto
  ? crypto.randomUUID()
  : `resume_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = window.indexedDB.open(DATABASE_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Could not open the local resume vault.'));
});

const transaction = async <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) => {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const request = action(database.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not update the local resume vault.'));
  }).finally(() => database.close());
};

export const resumeStore = {
  list: async () => {
    const resumes = await transaction<LiteResume[]>('readonly', (store) => store.getAll());
    return resumes.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  },
  add: async (file: File, name: string) => {
    const metadata: LiteResume = {
      id: createId(),
      name: name.trim() || file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      createdAt: new Date().toISOString()
    };
    await transaction('readwrite', (store) => store.put({ ...metadata, file }));
    return metadata;
  },
  remove: (id: string) => transaction('readwrite', (store) => store.delete(id))
};
