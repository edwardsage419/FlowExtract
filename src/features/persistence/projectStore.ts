import type { ProjectRecord } from '../project/types';

const DB_NAME = 'flowextract';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Local database operation failed.'));
  });
}

export function openProjectDatabase(factory: IDBFactory = indexedDB): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Unable to open FlowExtract local storage.'));
  });
}

async function withStore<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openProjectDatabase();
  try {
    const tx = db.transaction(STORE_NAME, mode);
    return await requestToPromise(operation(tx.objectStore(STORE_NAME)));
  } finally {
    db.close();
  }
}

export async function saveProject(project: ProjectRecord): Promise<void> {
  await withStore('readwrite', (store) => store.put(project));
}

export async function loadProject(id: string): Promise<ProjectRecord | undefined> {
  return withStore('readonly', (store) => store.get(id));
}

export async function listProjects(): Promise<ProjectRecord[]> {
  const projects = await withStore('readonly', (store) => store.getAll());
  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteProject(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id));
}
