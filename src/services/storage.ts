const DB_NAME = 'studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

// SSR guard - check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      reject(new Error('IndexedDB is not available in SSR'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
};

export const saveToStorage = async (key: string, data: any) => {
  if (!isBrowser) return; // Skip in SSR
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(data, key);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const loadFromStorage = async <T>(key: string): Promise<T | undefined> => {
  if (!isBrowser) return undefined; // Skip in SSR
  const db = await getDB();
  return new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      // request.result is undefined if the key does not exist, which is what we want to return
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};

// ==================== 主体库存储 ====================
import type { Subject } from '@/types';

const SUBJECTS_KEY = 'studio_subjects';
const SUBJECT_CATEGORIES_KEY = 'studio_subject_categories';

// 默认分类
const DEFAULT_CATEGORIES = ['character', 'object', 'animal', 'vehicle'];

/** 保存主体列表 */
export const saveSubjects = async (subjects: Subject[]): Promise<void> => {
  await saveToStorage(SUBJECTS_KEY, subjects);
};

/** 加载主体列表 */
export const loadSubjects = async (): Promise<Subject[]> => {
  return (await loadFromStorage<Subject[]>(SUBJECTS_KEY)) || [];
};

/** 保存分类列表 */
export const saveSubjectCategories = async (categories: string[]): Promise<void> => {
  await saveToStorage(SUBJECT_CATEGORIES_KEY, categories);
};

/** 加载分类列表 */
export const loadSubjectCategories = async (): Promise<string[]> => {
  return (await loadFromStorage<string[]>(SUBJECT_CATEGORIES_KEY)) || DEFAULT_CATEGORIES;
};