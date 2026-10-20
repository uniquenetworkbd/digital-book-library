# Digital Library & Book Authoring Platform - Complete Master Blueprint

## ১. প্রজেক্ট পরিচিতি ও আর্কিটেকচারাল ভিশন (System Architecture)

এই প্রজেক্টটি একটি সম্পূর্ণ ক্লায়েন্ট-সাইড **ডিজিটাল বুক লাইব্রেরি এবং ইন্টারেক্টিভ বুক রাইটিং প্ল্যাটফর্ম**। এটি কোনো বহিঃস্থ সার্ভার, ব্যাকএন্ড অ্যাপ্লিকেশান বা প্রোপারাইটারি ডাটাবেসের ওপর নির্ভর না করে সম্পূর্ণভাবে **GitHub Infrastructure (GitHub Pages, Repository Storage & GitHub REST API)**-এর ওপর ভিত্তি করে পরিচালিত হবে।

```text
+-----------------------------------------------------------------------+
|                            USER BROWSER                               |
|                                                                       |
|   +-----------------------+   +-------------------+                   |
|   |   Library Module      |   |   Reader Module   |                   |
|   |  (Catalog & Filter)   |   | (PDF.js / Epub)   |                   |
|   +-----------+-----------+   +---------+---------+                   |
|               |                         |                             |
|               +------------+------------+                             |
|                            |                                          |
|               +------------v------------+                             |
|               |   Book Creator Editor   |                             |
|               |   (Template Engine)     |                             |
|               +------------+------------+                             |
|                            |                                          |
|               +------------v------------+                             |
|               | IndexedDB StorageManager|                             |
|               |    (Auto-Save Drafts)   |                             |
|               +------------+------------+                             |
+----------------------------|------------------------------------------+
                             | GitHub API / Static Fetch
                             v
+-----------------------------------------------------------------------+
|                         GITHUB REPOSITORY                             |
|                                                                       |
|   +-----------------------+   +-----------------------------------+   |
|   |   /data/catalog.json  |   |   /data/published/*.json          |   |
|   |   (Catalog Metadata)   |   |   (Published Books Data)          |   |
|   +-----------------------+   +-----------------------------------+   |
|                                                                       |
+-----------------------------------------------------------------------+
```

---

## ২. কমপ্লিট ফোল্ডার ও ফাইল স্ট্রাকচার (Comprehensive File Tree)

প্রজেক্টের সম্পূর্ণ কোডবেস মোডিউলার আর্কিটেকচার মেনে সংগঠিত করা হয়েছে।

```text
digital-book-library/
├── index.html                  # হোম পেজ (লাইব্রেরি ক্যাটালগ ও ফিল্টার)
├── reader.html                 # বই পড়ার জন্য রিডার শেল
├── creator.html                # বই লেখার ও সম্পাদনা করার ইন্টারফেস
├── manifest.json               # PWA সাপোর্টের জন্য ওয়েব অ্যাপ ম্যানিফেস্ট
├── sw.js                       # অফলাইন সাপোর্ট ও ক্যাশিং-এর জন্য সার্ভিস ওয়ার্কার
├── README.md                   # মাস্টার প্রজেক্ট ডকুমেন্টেশন
│
├── assets/
│   ├── css/
│   │   ├── main.css            # গ্লোবাল ওয়েবসাইট লেআউট ও কালার স্কিম
│   │   ├── reader.css          # রিডার স্ক্রিনের টাইপোগ্রাফি ও থিম কাস্টমাইজেশন
│   │   └── editor.css          # এডিটর ইন্টারফেস, চ্যাপ্টার ট্র্রি ও প্যানেল ডিজাইন
│   ├── images/
│   │   ├── logo.svg
│   │   └── default-cover.png   # কভার ছবি না থাকলে ব্যবহৃত ডিফল্ট ইমেজ
│   └── templates/
│       ├── novel.json          # উপন্যাস টেমপ্লেট
│       ├── technical.json      # টেকনিক্যাল / ডকুমেন্টেশন টেমপ্লেট
│       └── research.json       # গবেষণা / নিবন্ধ টেমপ্লেট
│
├── src/                        # ES6 JavaScript Modules
│   ├── app.js                  # মেইন সাইট রাউটিং ও ইনিশিয়ালাইজেশন
│   │
│   ├── database/
│   │   ├── db.js               # IndexedDB (Dexie.js / Native) ইনস্ট্যান্স সেটআপ
│   │   └── StorageManager.js   # ড্রাফট অটো-সেভ ও লোকাল ডাটা রিট্রিভাল লজিক
│   │
│   ├── modules/
│   │   ├── library/
│   │   │   ├── LibraryController.js  # সার্চ, ফিল্টার ও সোর্টিং লজিক
│   │   │   └── LibraryView.js        # ক্যাটালগ রেন্ডারিং UI
│   │   │
│   │   ├── reader/
│   │   │   ├── ReaderController.js   # পেজ নেভিগেশন ও বুকমার্ক লজিক
│   │   │   └── ReaderView.js         # টেক্সট/পিডিএফ ইন্টারঅ্যাক্টিভ ভিউ
│   │   │
│   │   └── editor/
│   │       ├── EditorController.js   # ইনপুট হ্যান্ডলার ও অটো-সেভ ট্রিগার
│   │       ├── TemplateEngine.js     # ক্যাটাগরি স্ট্রাকচার জেনারেটর
│   │       └── EditorView.js         # ডাইনামিক UI ও ড্র্যাগ অ্যান্ড ড্রপ চ্যাপ্টার
│   │
│   └── utils/
│       ├── Exporter.js         # JSON / HTML / EPUB এক্সপোর্ট লজিক
│       └── GithubPublisher.js  # GitHub REST API-এর মাধ্যমে লাইভ পাবলিশিং
│
└── data/                       # জেনারেটেড ও প্রকাশিত বইয়ের ফোল্ডার
    ├── catalog.json            # সকল লাইভ বইয়ের মূল ক্যাটালগ ইন্ডেক্স
    └── published/
        ├── sample-novel.json
        └── sample-tech.json
```

---

## ৩. ডেটাবেস ও স্টোরেজ ডিজাইন (Database Schemas)

### ৩.১ `data/catalog.json` (লাইব্রেরি ক্যাটালগ স্কিমা)

```json
[
  {
    "id": "book-101",
    "title": "ডিজিটাল লাইব্রেরি আর্কিটেকচার",
    "author": "আব্দুল্লাহ আল মাসউদ",
    "category": "Technical",
    "description": "কীভাবে ফ্রন্টএন্ড টুলস দিয়ে ব্যাকএন্ডহীন প্ল্যাটফর্ম তৈরি করা যায়।",
    "coverImage": "assets/images/default-cover.png",
    "contentUrl": "data/published/book-101.json",
    "publishedAt": "2026-03-30",
    "tags": ["JavaScript", "Architecture", "GitHub"]
  }
]
```

### ৩.২ `data/published/{book-id}.json` (বইয়ের কনটেন্ট স্কিমা)

```json
{
  "meta": {
    "id": "book-101",
    "title": "ডিজিটাল লাইব্রেরি আর্কিটেকচার",
    "author": "আব্দুল্লাহ আল মাসউদ",
    "category": "Technical",
    "language": "bn",
    "createdAt": "2026-03-25",
    "updatedAt": "2026-03-30"
  },
  "chapters": [
    {
      "id": "ch-1",
      "title": "অধ্যায় ১: পরিচিতি",
      "content": "ওয়েব অ্যাপ্লিকেশন তৈরি করার ক্ষেত্রে...",
      "subsections": [
        {
          "id": "sub-1-1",
          "title": "১.১ প্ল্যাটফর্মের বৈশিষ্ট্য",
          "content": "এই প্ল্যাটফর্মের মূল বৈশিষ্ট্য হলো..."
        }
      ]
    }
  ]
}
```

### ৩.৩ IndexedDB ডাফট স্কিমা (`src/database/db.js`)

```javascript
// IndexedDB Schema (Web Browser Internal Database)
const DB_NAME = 'BookCreatorDB';
const DB_VERSION = 1;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('drafts')) {
        const store = db.createObjectStore('drafts', { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}
```

---

## ৪. কোড ফ্রেমওয়ার্ক ও মূল মডিউল বাস্তবায়ন (Core Code Snippets)

### ৪.১ অটো-সেভ ম্যানেজমেন্ট (`src/database/StorageManager.js`)

```javascript
import { initDB } from './db.js';

export class StorageManager {
  static async saveDraft(draftData) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');

      draftData.updatedAt = new Date().toISOString();
      const request = store.put(draftData);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  static async loadDraft(bookId) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['drafts'], 'readonly');
      const store = transaction.objectStore('drafts');
      const request = store.get(bookId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
```

### ৪.২ টেমপ্লেট ইঞ্জিন মডিউল (`src/modules/editor/TemplateEngine.js`)

```javascript
export class TemplateEngine {
  static async loadTemplate(categoryName) {
    try {
      const response = await fetch(`assets/templates/${categoryName.toLowerCase()}.json`);
      if (!response.ok) throw new Error('Template not found');
      return await response.json();
    } catch (error) {
      console.warn('Falling back to default novel template:', error);
      return {
        meta: { title: "নতুন বই", category: categoryName },
        chapters: [{ id: "ch-1", title: "অধ্যায় ১", content: "" }]
      };
    }
  }
}
```

### ৪.৩ GitHub API লাইভ পাবলিশিং (`src/utils/GithubPublisher.js`)

```javascript
export class GithubPublisher {
  constructor(patToken, repoOwner, repoName) {
    this.token = patToken;
    this.owner = repoOwner;
    this.repo = repoName;
  }

  async publishBook(bookId, bookContent, commitMessage) {
    const path = `data/published/${bookId}.json`;
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;

    // Convert content to Base64 (Required by GitHub API)
    const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(bookContent, null, 2))));

    const payload = {
      message: commitMessage || `Publish book: ${bookId}`,
      content: contentEncoded,
      branch: 'main'
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to commit file to GitHub repository.');
    return await response.json();
  }
}
```

---

## ৫. ডিপ্লয়মেন্ট ও সেটআপ ম্যানুয়েল (Deployment Manual)

### ৫.১ GitHub Repository সৃষ্টি

১. আপনার GitHub অ্যাকাউন্টে যান এবং **New Repository** বাটনে ক্লিক করুন।  
২. Repository Name: `digital-book-library` সেট করুন।  
৩. Visibility: **Public** রাখুন।  
৪. **Initialize with README** চেকবক্সে টিক দিয়ে তৈরি করুন।

### ৫.২ GitHub Pages কনফিগারেশন

১. Repository-র **Settings** মেনুতে যান।  
২. সাইডবার থেকে **Pages** বিকল্পে ক্লিক করুন।  
৩. **Source** সেকশনে `Deploy from a branch` নির্বাচন করুন।  
৪. **Branch**: `main` এবং **Folder**: `/ (root)` সিলেক্ট করে **Save** দিন।  
৫. ২ মিনিটের মধ্যে সাইটটি `https://<your-username>.github.io/digital-book-library/` ঠিকানায় লাইভ হবে।

---

I have generated the complete **Master Blueprint Document** in markdown format. It includes the architecture, directory tree, database schemas, and actual module codes to guide your implementation.
