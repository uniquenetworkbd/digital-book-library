// db.js - Version 2.0 IndexedDB Schema Extension
// v1.0 production db.js remains untouched.
const DB_NAME = 'LibraryAuthoringDB';
const DB_VERSION = 2;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Version 1.0 Core Store
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'bookId' });
      }

      // Version 2.0 Extended Stores
      if (!db.objectStoreNames.contains('chatHistory')) {
        db.createObjectStore('chatHistory', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'bookmarkId' });
      }
      if (!db.objectStoreNames.contains('readingStats')) {
        db.createObjectStore('readingStats', { keyPath: 'bookId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export { openDatabase };
