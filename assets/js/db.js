const DB_NAME = 'LibraryAuthoringDB';
const DB_VERSION = 2;
const DRAFTS_STORE = 'drafts';
const CHAT_STORE = 'chatHistory';
const BOOKMARKS_STORE = 'bookmarks';
const STATS_STORE = 'readingStats';

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed.'));
  });
}

export function initDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported by this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // V1 used keyPath "id". Keep that contract unchanged so existing drafts survive.
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        db.createObjectStore(DRAFTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CHAT_STORE)) {
        const store = db.createObjectStore(CHAT_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('bookId', 'bookId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(BOOKMARKS_STORE)) {
        const store = db.createObjectStore(BOOKMARKS_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('bookId', 'bookId', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STATS_STORE)) {
        const store = db.createObjectStore(STATS_STORE, { keyPath: 'id' });
        store.createIndex('bookId', 'bookId', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
    request.onblocked = () => reject(new Error('Database upgrade is blocked. Close other library tabs and retry.'));
    request.onsuccess = (event) => {
      const db = event.target.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error || new Error('Database initialization failed.'));
  });
}

export async function saveDraft(draftData) {
  const db = await initDB();
  const data = { ...draftData, updatedAt: new Date().toISOString() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFTS_STORE, 'readwrite');
    tx.objectStore(DRAFTS_STORE).put(data);
    tx.oncomplete = () => resolve(data);
    tx.onerror = () => reject(tx.error || new Error('Draft save failed.'));
  });
}

export async function loadDraft(id) {
  const db = await initDB();
  return requestToPromise(db.transaction(DRAFTS_STORE, 'readonly').objectStore(DRAFTS_STORE).get(id));
}

export async function saveBookmark(bookmark) {
  const db = await initDB();
  const data = { ...bookmark, updatedAt: new Date().toISOString() };
  return requestToPromise(new PromiseRequest(db.transaction(BOOKMARKS_STORE, 'readwrite').objectStore(BOOKMARKS_STORE).put(data)));
}

// PromiseRequest is intentionally tiny: it attaches the request handlers before the transaction can finish.
function PromiseRequest(request) {
  return request;
}

export async function getBookmarks(bookId, type) {
  const db = await initDB();
  const tx = db.transaction(BOOKMARKS_STORE, 'readonly');
  const store = tx.objectStore(BOOKMARKS_STORE);
  const source = type ? store.index('type') : store.index('bookId');
  const key = type || bookId;
  const request = source.getAll(key);
  const rows = await requestToPromise(request);
  return type ? rows.filter((row) => row.bookId === bookId) : rows;
}

export async function deleteBookmark(id) {
  const db = await initDB();
  const tx = db.transaction(BOOKMARKS_STORE, 'readwrite');
  tx.objectStore(BOOKMARKS_STORE).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error('Bookmark delete failed.'));
  });
}

export async function saveReadingStat(bookId, patch = {}) {
  const db = await initDB();
  const id = String(bookId);
  const store = db.transaction(STATS_STORE, 'readwrite').objectStore(STATS_STORE);
  const current = await requestToPromise(store.get(id));
  const data = { id, bookId: id, ...current, ...patch, updatedAt: new Date().toISOString() };
  return requestToPromise(store.put(data));
}

export async function loadReadingStat(bookId) {
  const db = await initDB();
  return requestToPromise(db.transaction(STATS_STORE, 'readonly').objectStore(STATS_STORE).get(String(bookId)));
}

export async function addChatMessage(message) {
  const db = await initDB();
  const data = { ...message, createdAt: message.createdAt || new Date().toISOString() };
  return requestToPromise(db.transaction(CHAT_STORE, 'readwrite').objectStore(CHAT_STORE).add(data));
}

export async function getChatHistory(bookId) {
  const db = await initDB();
  const rows = await requestToPromise(db.transaction(CHAT_STORE, 'readonly').objectStore(CHAT_STORE).index('bookId').getAll(String(bookId)));
  return rows.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
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

export { DB_NAME, DB_VERSION };
