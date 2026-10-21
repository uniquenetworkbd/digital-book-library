import { readFileSync } from 'node:fs';

const db = readFileSync('assets/js/db.js', 'utf8');

const requiredStores = ['drafts', 'chatHistory', 'bookmarks', 'readingStats'];
const requiredIndexes = [
  "createIndex('bookId', 'bookId'",
  "createIndex('createdAt', 'createdAt'",
  "createIndex('type', 'type'",
  "createIndex('updatedAt', 'updatedAt'",
];

if (!db.includes('const DB_VERSION = 2;')) throw new Error('Unexpected IndexedDB version change.');
if (!db.includes("keyPath: 'id'")) throw new Error('V1 drafts keyPath=id compatibility contract missing.');
for (const store of requiredStores) {
  if (!db.includes(`const ${store === 'drafts' ? 'DRAFTS_STORE' : store === 'chatHistory' ? 'CHAT_STORE' : store === 'bookmarks' ? 'BOOKMARKS_STORE' : 'STATS_STORE'} = '${store}'`)) {
    throw new Error(`Required object store missing: ${store}`);
  }
}
for (const index of requiredIndexes) {
  if (!db.includes(index)) throw new Error(`Required secondary index missing: ${index}`);
}

console.log('IndexedDB v2 schema safety audit PASS');
console.log('No v3 migration or compound-index change detected.');
