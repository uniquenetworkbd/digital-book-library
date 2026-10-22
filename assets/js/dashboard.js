(() => {
  'use strict';

  const databaseName = 'LibraryAuthoringDB';
  const storeNames = ['drafts', 'chatHistory', 'bookmarks', 'readingStats'];
  const element = (id) => document.getElementById(id);
  const safeParse = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; } };

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
      const request = indexedDB.open(databaseName, 2);
      request.onupgradeneeded = () => {
        const db = request.result;
        storeNames.forEach((name) => { if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' }); });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open local database'));
      request.onblocked = () => reject(new Error('Database upgrade is blocked by another tab'));
    });
  }

  function readStore(db, name) {
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(name)) return resolve([]);
      const request = db.transaction(name, 'readonly').objectStore(name).getAll();
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
      request.onerror = () => resolve([]);
    });
  }

  function localMetrics() {
    const catalog = safeParse(localStorage.getItem('dbl:catalog-cache'), []);
    const stats = safeParse(localStorage.getItem('reading-stats'), []);
    const draft = safeParse(localStorage.getItem('dbl:draft-current'), null);
    const minutes = Array.isArray(stats) ? stats.reduce((sum, item) => sum + (Number(item.minutes || item.readingTimeMinutes) || 0), 0) : 0;
    return { catalogCount: Array.isArray(catalog) ? catalog.length : 0, draftCount: draft ? 1 : 0, bookmarks: 0, sessions: Array.isArray(stats) ? stats.length : 0, minutes, recent: Array.isArray(stats) ? stats : [] };
  }

  function paint(metrics, dbVersion) {
    element('metric-books').textContent = metrics.catalogCount;
    element('metric-drafts').textContent = metrics.draftCount;
    element('metric-bookmarks').textContent = metrics.bookmarks;
    element('metric-sessions').textContent = metrics.sessions;
    element('reading-minutes').textContent = `${metrics.minutes} ${metrics.minutes === 1 ? 'minute' : 'minutes'} recorded`;
    element('storage-state').textContent = `IndexedDB ${dbVersion} · local`;
    element('db-version').textContent = `LibraryAuthoringDB schema ${dbVersion}; metrics are read-only.`;
    const recent = [...metrics.recent].sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))).slice(0, 5);
    element('recent-reading').className = recent.length ? '' : 'empty-state';
    element('recent-reading').innerHTML = recent.length ? recent.map((item) => `<div class="chapter-row"><span>${String(item.title || item.bookTitle || item.bookId || 'Reading session').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])}</span><span class="muted">${Number(item.minutes || item.readingTimeMinutes) || 0} min</span></div>`).join('') : 'Reading activity will appear here when you use the Reader.';
  }

  async function refresh() {
    const fallback = localMetrics();
    try {
      const db = await openDatabase();
      const [drafts, bookmarks, stats] = await Promise.all(storeNames.map((name) => readStore(db, name)));
      const metrics = { ...fallback, draftCount: drafts.length || fallback.draftCount, bookmarks: bookmarks.length, sessions: stats.length || fallback.sessions, minutes: stats.reduce((sum, item) => sum + (Number(item.minutes || item.readingTimeMinutes) || 0), 0) || fallback.minutes, recent: stats.length ? stats : fallback.recent };
      paint(metrics, db.version); db.close();
    } catch (_) {
      element('storage-state').textContent = 'Local storage fallback';
      paint(fallback, 'unavailable');
    }
  }

  refresh();
  window.addEventListener('storage', refresh);
  window.addEventListener('focus', refresh);
})();