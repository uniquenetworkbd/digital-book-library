/**
 * Digital Book Library v2.0 — Complete local backup & restore engine.
 * Works with the currently deployed IndexedDB schema and any compatible V2 stores.
 */

class BackupEngine {
  constructor() {
    this.dbName = 'LibraryAuthoringDB';
    this.dbVersion = 1;
    this.storeNames = ['drafts', 'chatHistory', 'bookmarks', 'readingStats'];
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is not supported by this browser.'));
        return;
      }
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Database open failed.'));
    });
  }

  async exportFullBackup() {
    const db = await this.openDatabase();
    try {
      const backupData = {
        format: 'digital-book-library-backup',
        version: 2,
        exportedAt: new Date().toISOString(),
        dbName: this.dbName,
        dbVersion: db.version,
        localStorageData: { ...localStorage },
        stores: {}
      };

      for (const storeName of this.storeNames) {
        if (db.objectStoreNames.contains(storeName)) {
          backupData.stores[storeName] = await this.getAllFromStore(db, storeName);
        }
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `digital_book_library_backup_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      return true;
    } finally {
      db.close();
    }
  }

  async restoreFullBackup(file) {
    const data = await this.readBackupFile(file);
    if (!data || data.format !== 'digital-book-library-backup' || !data.stores) {
      throw new Error('Invalid backup file format.');
    }

    if (data.localStorageData && typeof data.localStorageData === 'object') {
      Object.entries(data.localStorageData).forEach(([key, value]) => {
        localStorage.setItem(key, String(value));
      });
    }

    const db = await this.openDatabase();
    try {
      for (const [storeName, items] of Object.entries(data.stores)) {
        if (db.objectStoreNames.contains(storeName) && Array.isArray(items)) {
          await this.clearAndPopulateStore(db, storeName, items);
        }
      }
    } finally {
      db.close();
    }
    return true;
  }

  readBackupFile(file) {
    return new Promise((resolve, reject) => {
      if (!(file instanceof File)) {
        reject(new Error('A backup file is required.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(reader.result));
        } catch (error) {
          reject(new Error(`Backup JSON is invalid: ${error.message}`));
        }
      };
      reader.onerror = () => reject(reader.error || new Error('Backup file read failed.'));
      reader.readAsText(file);
    });
  }

  getAllFromStore(db, storeName) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error || new Error(`Read failed: ${storeName}`));
    });
  }

  clearAndPopulateStore(db, storeName, items) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear().onsuccess = () => {
        try {
          items.forEach((item) => store.put(item));
        } catch (error) {
          tx.abort();
          reject(error);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error(`Restore failed: ${storeName}`));
      tx.onabort = () => reject(tx.error || new Error(`Restore aborted: ${storeName}`));
    });
  }
}

window.backupEngine = new BackupEngine();
