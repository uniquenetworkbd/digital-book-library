# Digital Book Library — Complete Roadmap Documentation

> এই ডকুমেন্টটি `uniquenetworkbd/digital-book-library` রিপোজিটরির `main` branch-এ বর্তমানে তৈরি ও লাইভ থাকা অধ্যায় ১–৫-এর একটি একত্রিত Roadmap Document। এটি লাইভ GitHub documentation inventory যাচাই করে তৈরি করা হয়েছে।

## Live Documentation Status

| অধ্যায় | অংশ | বর্তমান অবস্থা |
|---|---|---|
| ১ | 1.1 System Overview & Purpose | ✅ Live |
| ১ | 1.2 Folder & File Structure | ⚠️ Dedicated file skeleton; content বর্তমানে 1.1-এ আছে |
| ১ | 1.3 Technology Stack Selection | ⚠️ Dedicated file skeleton; content বর্তমানে 1.1-এ আছে |
| ২ | 2.1 JSON Schema Design | ✅ Live |
| ২ | 2.2 IndexedDB & StorageManager | ✅ Live |
| ৩ | 3.1 Library UI | ✅ Live |
| ৩ | 3.2 Book Reader | ✅ Live |
| ৪ | 4.1 Template Engine | ✅ Live |
| ৪ | 4.2 Writing Editor & Chapter Management | ✅ Live |
| ৪ | 4.3 Preview, Export & Publishing | ✅ Live |
| ৫ | 5.1 GitHub Pages Deployment | ✅ Live |
| ৫ | 5.2 Direct Publishing Workflow | ✅ Live |
| ৫ | 5.3 Maintenance & Security | ✅ Live |

---

# ১. প্রজেক্ট পরিচিতি ও আর্কিটেকচার ডিজাইন

## ১.১ সিস্টেম ওভারভিউ ও উদ্দেশ্য

**মূল লক্ষ্য:** GitHub Pages-এর স্ট্যাটিক হোস্টিং ব্যবহার করে সম্পূর্ণ ব্রাউজার-বেইজড (Client-side) একটি ডিজিটাল বুক লাইব্রেরি এবং বুক অথরিং প্ল্যাটফর্ম তৈরি করা। এখানে কোনো এক্সটার্নাল সার্ভার, PHP বা ট্রেডিশনাল ডাটাবেস ব্যবহার করা হবে না।

### প্রধান উদ্দেশ্য

- ব্যবহারকারীরা বিনামূল্যে বই পড়তে পারবেন এবং ক্যাটাগরি অনুযায়ী বই সার্চ বা ফিল্টার করতে পারবেন।
- লেখকরা ওয়েবসাইট থেকেই নির্দিষ্ট টেমপ্লেট সিলেক্ট করে নতুন বই লিখতে পারবেন।
- IndexedDB ব্যবহার করে লেখার সময় রিয়াল-টাইম অটো-সেভ রাখা হবে।
- কাজ শেষে GitHub-এর মাধ্যমে বই লাইব্রেরিতে প্রকাশ করার ব্যবস্থা থাকবে।

## ১.২ কমপ্লিট ফোল্ডার ও ফাইল স্ট্রাকচার

বর্তমান roadmap-এ নির্ধারিত structure:

```text
digital-book-library/
├── index.html
├── reader.html
├── creator.html
├── README.md
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── reader.css
│   │   └── editor.css
│   ├── js/
│   │   ├── app.js
│   │   ├── reader.js
│   │   ├── editor.js
│   │   └── db.js
│   └── templates/
│       ├── novel.json
│       └── technical.json
└── data/
    ├── catalog.json
    └── books/
```

বর্তমান dedicated `01.2-complete-folder-and-file-structure.md` ফাইলটি এখনও skeleton অবস্থায় আছে; উপরোক্ত content বর্তমানে `01.1-system-overview-and-purpose.md`-এ সংরক্ষিত আছে।

## ১.৩ টেকনোলজি স্ট্যাক

- **GitHub Pages:** ফ্রি static hosting ও Git version control।
- **Vanilla JavaScript (ES6+):** lightweight client-side execution।
- **IndexedDB:** browser-local draft storage।
- **JSON:** data exchange ও catalog storage-এর standard format।

Dedicated `01.3-technology-stack-selection.md` ফাইলটিও বর্তমানে skeleton; content 1.1-এ রয়েছে।

---

# ২. ডেটাবেস ও স্টোরেজ ডিজাইন

এই প্ল্যাটফর্মে external server-side database ব্যবহার না করে data management দুই ভাগে বিভক্ত:

1. **Public Data Layer:** `catalog.json` ও বইয়ের JSON ফাইল GitHub repository-তে থাকবে।
2. **Local Storage Layer:** লেখকের draft IndexedDB-তে থাকবে।

## ২.১ `catalog.json` ও Book JSON Schema

### `data/catalog.json`

প্রকাশিত বইয়ের metadata:

```json
[
  {
    "id": "book-001",
    "title": "বাংলা সাহিত্যের ইতিহাস",
    "author": "রাফসান জামিল",
    "category": "Literature",
    "coverImage": "assets/covers/book-001.jpg",
    "filePath": "data/books/book-001.json",
    "publishDate": "2026-10-21"
  },
  {
    "id": "book-002",
    "title": "ডেটা স্ট্রাকচার ও অ্যালগরিদম",
    "author": "টেক টিম",
    "category": "Technical",
    "coverImage": "assets/covers/book-002.jpg",
    "filePath": "data/books/book-002.json",
    "publishDate": "2026-10-21"
  }
]
```

### `data/books/book-001.json`

```json
{
  "bookId": "book-001",
  "title": "বাংলা সাহিত্যের ইতিহাস",
  "author": "রাফসান জামিল",
  "category": "Literature",
  "chapters": [
    {
      "chapterId": 1,
      "title": "প্রাক-কথা ও ভূমিকা",
      "content": "এখানে প্রথম অধ্যায়ের মূল টেক্সট বা মার্কডাউন ফরম্যাটের কন্টেন্ট থাকবে..."
    },
    {
      "chapterId": 2,
      "title": "প্রথম অধ্যায়: প্রাচীন যুগ",
      "content": "চর্যাপদ ও প্রাচীন যুগের সাহিত্য নিয়ে বিস্তারিত আলোচনা..."
    }
  ]
}
```

## ২.২ IndexedDB ও StorageManager

`assets/js/db.js`-এর StorageManager লেখকের local draft নিরাপদে রাখবে।

- `LibraryAuthoringDB` নামে browser-local database।
- `drafts` object store।
- লেখার সময় debounce timer, যেমন ৩ সেকেন্ড।
- status: `Saving...` → `Saved locally`।
- editor পুনরায় খুললে অসমাপ্ত draft শনাক্ত করা হবে।
- draft থাকলে restore prompt দেখানো হবে:

> "আপনার আগের অসমাপ্ত ড্রাফট পাওয়া গেছে, এটি কি রিস্টোর করতে চান?"

---

# ৩. লাইব্রেরি ও রিডার মডিউল ডেভেলপমেন্ট

## ৩.১ লাইব্রেরি UI

`assets/js/app.js` `catalog.json` fetch করে `index.html`-এ বইয়ের card/grid render করবে।

### মূল ফিচার

- Dynamic catalog rendering।
- বইয়ের title বা author দিয়ে real-time search।
- Literature, Technical, Novel ইত্যাদি category filtering।
- `Read Now` button থেকে `reader.html?id=book-001`-এ redirect।

## ৩.২ Book Reader Module

`assets/js/reader.js` ও `assets/css/reader.css` রিডার মডিউল পরিচালনা করবে।

### মূল ফিচার

1. URL থেকে `?id=book-001` গ্রহণ।
2. `data/books/book-001.json` fetch।
3. Sidebar/Table of Contents।
4. Chapter content rendering।
5. Font size `+ / -` এবং font style controls।
6. Night/Dark Mode।
7. Previous/Next Chapter navigation।

---

# ৪. বুক ক্রিয়েটর ও এডিটর মডিউল ডেভেলপমেন্ট

এই অধ্যায়ে `creator.html`-কে লেখকদের digital book writing studio হিসেবে পরিকল্পনা করা হয়েছে।

## ৪.১ Template Engine

`assets/templates/`-এর preset JSON ব্যবহার করে নতুন বইয়ের structure তৈরি হবে।

### Category Selection

লেখক Novel, Technical, Research ইত্যাদি category/genre নির্বাচন করতে পারবেন।

### Auto Structure Generation

Category নির্বাচনের সঙ্গে সঙ্গে নির্দিষ্ট template যেমন `novel.json` load হয়ে editor-এর মধ্যে chapter skeleton/tree তৈরি করবে—যেমন প্রাক-কথা, অধ্যায় ১, অধ্যায় ২, উপসংহার।

## ৪.২ Writing Editor ও Chapter Management

### Text Editing & Formatting

Clean text area বা rich-text editor থাকবে, যেখানে paragraph, heading, bold, italic এবং code block ব্যবহারের সুবিধা থাকবে।

### Chapter Management

- Add chapter
- Delete chapter
- Rename chapter

### Drag-and-Drop

Chapter mouse দিয়ে drag করে উপরে/নিচে সরিয়ে order পরিবর্তন করা যাবে।

## ৪.৩ Real-time Preview, Export & Publishing

### Live Preview

Editor-এর পাশে preview panel/toggle থাকবে এবং real-time reader-mode appearance দেখা যাবে।

### Local Export

লেখক সম্পূর্ণ বই `.json` ফরম্যাটে backup/save করার জন্য download করতে পারবেন। Roadmap heading-এ JSON/EPUB Download উল্লেখ আছে।

### Publish to Library

`Publish to Library` button final content থেকে `catalog.json` metadata এবং `data/books/` content-এর জন্য প্রয়োজনীয় JSON code বা GitHub Commit নির্দেশিকা generate করবে।

---

# ৫. ডিপ্লয়মেন্ট ও মেইনটেন্যান্স গাইড

## ৫.১ GitHub Pages Deployment

External hosting ছাড়াই GitHub Pages ব্যবহার করে project live করা হবে।

### Deployment Steps

1. `index.html`, `reader.html`, `creator.html`, `assets/`, `data/` সঠিকভাবে repository-র `main` বা `master` branch-এ commit/push করা।
2. Repository → **Settings** → **Pages**।
3. **Build and deployment** থেকে **Deploy from a branch** নির্বাচন।
4. Branch হিসেবে `main` এবং folder হিসেবে `/ (root)` নির্বাচন করে Save।
5. কিছু সময় পর GitHub Pages-এর official live URL পাওয়া যাবে।

## ৫.২ Direct Publishing Workflow

### Manual Publishing

1. Editor থেকে `Export Book` বা `Download JSON`।
2. `.json` ফাইল `data/books/`-এ upload।
3. `data/catalog.json`-এ নতুন বইয়ের ID, নাম, লেখক ও file path metadata যোগ।
4. Commit করার পর বইটি library-তে যুক্ত হবে।

### GitHub API / PAT Based Publishing

Editor-এ `Publish Settings` panel থাকবে। সেখানে GitHub Personal Access Token ব্যবহারের পরিকল্পনা রয়েছে। `Publish` করলে GitHub official API-এর মাধ্যমে `data/books/` এবং `data/catalog.json` update করার workflow নির্ধারিত হয়েছে।

## ৫.৩ Maintenance & Security

### Backup

IndexedDB-তে local drafts থাকার কারণে browser cache পরিষ্কার করার আগে draft JSON file হিসেবে export করে backup রাখা নিরাপদ।

### Copyright & Moderation

Public library-তে upload করা content যেন copyright law মেনে চলে এবং harmful code/script মুক্ত থাকে তা নিশ্চিত করার বিষয়ে সতর্ক থাকতে হবে।

---

# সমন্বিত End-to-End Workflow

```text
Author
  │
  ▼
creator.html
  │
  ├── Category নির্বাচন
  │       │
  │       ▼
  │   Template Engine
  │       │
  │       ▼
  │   Chapter Structure
  │
  ├── Writing / Formatting
  │
  ├── Add / Delete / Rename Chapter
  │
  ├── Drag & Drop Ordering
  │
  ├── IndexedDB Auto-Save
  │
  ▼
Live Preview
  │
  ▼
JSON Export / Publish Workflow
  │
  ├── data/books/{book}.json
  └── data/catalog.json
          │
          ▼
      GitHub Repository
          │
          ▼
      GitHub Pages
          │
          ▼
       index.html
          │
          ├── Search / Filter
          │
          ▼
       reader.html
          │
          └── Chapter Reading
```

# বর্তমান Documentation Source Map

- Chapter 1: `docs/01-project-introduction-and-architecture/`
- Chapter 2: `docs/02-database-and-storage-design/`
- Chapter 3: `docs/03-library-and-reader-module/`
- Chapter 4: `docs/04-book-creator-and-editor/`
- Chapter 5: `docs/05-deployment-and-maintenance/`
- Existing broader blueprint: `docs/Master-Blueprint-Document.md`

## Live Audit Note

এই consolidated document-এ Chapter 1-এর 1.2 ও 1.3-এর documented content `01.1-system-overview-and-purpose.md`-এ বর্তমানে যেভাবে আছে সেভাবেই অন্তর্ভুক্ত করা হয়েছে। Live repository check অনুযায়ী dedicated `01.2` এবং `01.3` files এখনও skeleton অবস্থায় রয়েছে; সেগুলোকে এই document তৈরির সময় আলাদাভাবে পরিবর্তন করা হয়নি।

এই ডকুমেন্টের উদ্দেশ্য হলো বর্তমান roadmap-এর Chapter 1–5-কে একটি single reference document হিসেবে এক জায়গায় রাখা। এটি existing `Master-Blueprint-Document.md`-কে overwrite বা replace করে না।
