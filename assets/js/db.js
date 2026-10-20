const DB_NAME = 'LibraryAuthoringDB';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

export function initDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported by this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => reject(request.error || new Error('Database initialization failed.'));
  });
}

export async function saveDraft(draftData) {
  const db = await initDB();
  const data = { ...draftData, updatedAt: new Date().toISOString() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data);
    tx.oncomplete = () => resolve(data);
    tx.onerror = () => reject(tx.error || new Error('Draft save failed.'));
  });
}

export async function loadDraft(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Draft load failed.'));
  });
}

export function createAutoSaver(getState, setStatus, delay = 3000) {
  let timer = null;
  return function schedule() {
    setStatus('Saving...');
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await saveDraft(getState());
        setStatus('Saved locally');
      } catch (error) {
        console.error(error);
        setStatus('Save failed');
      }
    }, delay);
  };
}
