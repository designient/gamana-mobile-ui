import type { DownloadState, DownloadStatus } from '../types';

const DB_NAME = 'gamana_offline';
const DB_VERSION = 1;
const DOWNLOADS_STORE = 'downloads';
const STORIES_STORE = 'stories';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DOWNLOADS_STORE)) {
        const store = db.createObjectStore(DOWNLOADS_STORE, { keyPath: ['itemType', 'itemId'] });
        store.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORIES_STORE)) {
        db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

function tx(
  storeName: string,
  mode: IDBTransactionMode,
): Promise<{ store: IDBObjectStore; complete: Promise<void> }> {
  return openDb().then((db) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const complete = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    return { store, complete };
  });
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------------------------------------------------------------------------
// Download state CRUD
// ---------------------------------------------------------------------------
export async function getDownload(
  itemType: DownloadState['itemType'],
  itemId: string,
): Promise<DownloadState | null> {
  try {
    const { store } = await tx(DOWNLOADS_STORE, 'readonly');
    return (await idbRequest(store.get([itemType, itemId]))) ?? null;
  } catch {
    return null;
  }
}

export async function getAllDownloads(): Promise<DownloadState[]> {
  try {
    const { store } = await tx(DOWNLOADS_STORE, 'readonly');
    return (await idbRequest(store.getAll())) ?? [];
  } catch {
    return [];
  }
}

export async function getDownloadsByStatus(status: DownloadStatus): Promise<DownloadState[]> {
  try {
    const { store } = await tx(DOWNLOADS_STORE, 'readonly');
    const index = store.index('status');
    return (await idbRequest(index.getAll(status))) ?? [];
  } catch {
    return [];
  }
}

export async function setDownload(state: DownloadState): Promise<void> {
  const { store, complete } = await tx(DOWNLOADS_STORE, 'readwrite');
  store.put(state);
  await complete;
}

export async function removeDownload(
  itemType: DownloadState['itemType'],
  itemId: string,
): Promise<void> {
  const { store, complete } = await tx(DOWNLOADS_STORE, 'readwrite');
  store.delete([itemType, itemId]);
  await complete;
}

// ---------------------------------------------------------------------------
// Offline story metadata
// ---------------------------------------------------------------------------
export async function saveStoryOffline(story: unknown): Promise<void> {
  const { store, complete } = await tx(STORIES_STORE, 'readwrite');
  store.put(story);
  await complete;
}

export async function getOfflineStory(id: string): Promise<unknown | null> {
  try {
    const { store } = await tx(STORIES_STORE, 'readonly');
    return (await idbRequest(store.get(id))) ?? null;
  } catch {
    return null;
  }
}

export async function getAllOfflineStories(): Promise<unknown[]> {
  try {
    const { store } = await tx(STORIES_STORE, 'readonly');
    return (await idbRequest(store.getAll())) ?? [];
  } catch {
    return [];
  }
}
