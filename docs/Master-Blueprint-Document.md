# Digital Book Library — Comprehensive Master Blueprint Document (v2.0)

> **Document Version:** 2.0.0 (Enterprise Serverless Architecture)  
> **Ecosystem Standard:** Pure Client-Side, PWA-Ready, Zero-Cost Hosting  
> **Deployment Target:** GitHub Pages / Any Static Web Server  

---

## ১. প্রজেক্টের মূল উদ্দেশ্য ও লক্ষ্য (Project Vision & Core Objectives)

`digital-book-library` প্ল্যাটফর্মটি তৈরির মূল লক্ষ্য হলো একটি আধুনিক, উচ্চগতিসম্পন্ন, এবং এআই-সক্ষম ডিজিটাল বুক রিডিং, ড্রাফটিং ও লাইব্রেরি ম্যানেজমেন্ট ইকোসিস্টেম গড়ে তোলা।

### মূল স্তম্ভসমূহ (Core Pillars):
1. **১০০% জিরো-কস্ট ও সার্ভারলেস আর্কিটেকচার:** কোনো পেইড ডাটাবেস বা ব্যাকএন্ড সার্ভার ছাড়াই কেবল ক্লায়েন্ট-সাইড টেকনোলজি (HTML5, CSS3, Vanilla ES6+ JavaScript, IndexedDB) ব্যবহার করে সম্পূর্ণ সিস্টেম সচল রাখা।
2. **অফলাইন-ফার্স্ট PWA সাপোর্ট:** সার্ভিস ওয়ার্কার (`sw.js`) এবং ওয়েব অ্যাপ ম্যানিফেস্টের মাধ্যমে ডিভাইস নির্বিশেষে এটি নেটিভ অ্যাপের মতো কাজ করবে এবং ইন্টারনেট সংযোগ ছাড়াই বই পড়া নিশ্চিত করবে।
3. **স্মার্ট এআই ও বট ইন্টিগ্রেশন (৬০টি ফিচার):** পাঠকের অভিজ্ঞতা সমৃদ্ধ করতে টেক্সট-টু-স্পিচ (TTS), ফজি সার্চ, অটোমেটিক টেক্সট সামারাইজেশন এবং ইন্টারেক্টিভ চ্যাট উইজেট সরবরাহ করা।
4. **ইউজার এক্সপেরিয়েন্স এনহ্যান্সমেন্টস (১৬টি UI/UX ফিচার):** ডার্ক/সেপিয়া থিম ইঞ্জিন, কাস্টম টাইপোগ্রাফি, বুকমার্কিং এবং অটো রিডিং-পজিশন সেভিং।
5. **গ্রাফিক্যাল ড্যাশবোর্ড ও ডেটা ওনারশিপ:** ব্যবহারকারীর পড়ার পরিসংখ্যান ভিজ্যুয়াল গ্রাফ আকারে উপস্থাপন এবং সম্পূর্ণ প্রজেক্টের ডাটা একক ক্লিকে ব্যাকআপ ও রিস্টোর করার নিশ্চয়তা দেওয়া।

---

## ২. কমপ্লিট ফোল্ডার ও ফাইল স্ট্রাকচার (v2.0 Architectural Map)

নতুন ফিচারসমূহ (PWA, Dashboard, Backup Engine, Bot Assets) সংযুক্ত করার পর প্রজেক্টের সম্পূর্ণ গঠন নিচে দেখানো হলো:

```text
digital-book-library/
├── index.html                           # [v1.0 Core] মূল লাইব্রেরি ও ক্যাটালগ UI
├── reader.html                          # [v1.0 Core] বুক রিডার মডিউল Interface
├── creator.html                         # [v1.0 Core] রাইটিং স্টুডিও ও ড্রাফটার
├── dashboard.html                       # [v2.0 NEW] এনালিটিক্স, গ্রাফিক্যাল চার্ট ও ব্যাকআপ সেন্টার
├── README.md                            # [v1.0 Core] প্রজেক্ট গাইডলাইন
├── CNAME                                # [v1.0 Optional] কাস্টম ডোমেইন স্পেসিফিকেশন
├── manifest.json                        # [v2.0 NEW] PWA কনফিগারেশন ফাইল
├── sw.js                                # [v2.0 NEW] অফলাইন ক্যাশিং সার্ভিস ওয়ার্কার
│
├── assets/
│   ├── css/
│   │   ├── main.css                     # [v1.0 Core] মূল সাইট লেআউট স্টাইল
│   │   ├── reader.css                   # [v1.0 Core] রিডার মোড টাইপোগ্রাফি ও লেআউট
│   │   ├── editor.css                   # [v1.0 Core] ক্রিয়েটর স্টুডিও স্টাইল
│   │   ├── bot.css                      # [v2.0 NEW] ফ্লোটিং চ্যাট উইজেট ও বট অ্যানিমেশন UI
│   │   └── dashboard.css                # [v2.0 NEW] ড্যাশবোর্ড কার্ড, গ্রাফ ও প্রোগ্রেস বার স্টাইল
│
│   ├── js/
│   │   ├── app.js                       # [v1.0 Core] হোমপেজ মেটাডেটা ও সার্চ লজিক
│   │   ├── reader.js                    # [v1.0 Core] চ্যাপ্টার নেভিগেটর
│   │   ├── editor.js                    # [v1.0 Core] বুক রাইটিং ড্রাফটার
│   │   ├── db.js                        # [v2.0 Updated] IndexedDB v2 স্টোরেজ ম্যানেজার
│   │   ├── bot.js                       # [v2.0 NEW] বট ইন্টারেকশন, স্লাশ কমান্ড ও UI লজিক
│   │   ├── ai-engine.js                 # [v2.0 NEW] ক্লায়েন্ট-সাইড সার্চ ও টেক্সট সামারাইজার
│   │   ├── tts-engine.js                # [v2.0 NEW] Web Speech API অডিও রিডার
│   │   ├── ui-enhancements.js            # [v2.0 NEW] থিম ইঞ্জিন (Sepia/Dark) ও ফন্ট সাইজার
│   │   ├── backup-engine.js             # [v2.0 NEW] JSON/JSZip ব্যাকআপ ও রিস্টোর ম্যানেজার
│   │   └── dashboard.js                 # [v2.0 NEW] ক্যানভাস চার্ট রেন্ডারার ও স্ট্যাটস লজিক
│
│   ├── covers/                          # [v2.0 NEW] কাস্টম আপলোডেড কভার ইমেজ
│   │   └── default-cover.png
│
│   └── templates/                       # [v1.0 Core] বুক স্ট্রাকচারাল JSON টেমপ্লেট
│       ├── novel.json
│       ├── technical.json
│       └── research.json                # [v2.0 NEW] গবেষণা ও অ্যাকাডেমিক টেমপ্লেট
│
├── data/
│   ├── catalog.json                     # [v2.0 Updated] সম্প্রসারিত ক্যাটালগ ও মেটাডেটা
│   └── books/
│       ├── book-001.json
│       └── book-002.json
│
└── docs/
    ├── Master-Blueprint-Document.md     # [v2.0 Document] মূল আর্কিটেকচারাল ব্লুপ্রিন্ট
    ├── master_roadmap_v2.md             # [v2.0 Document] ৭৬টি ফিচারের মাস্টার তালিকা
    ├── bot_integration_roadmap.md       # [v2.0 Document] ৬০টি বটের বিশেষ বিশদ বিবরণ
    └── frontend_enhancement_roadmap.md  # [v2.0 Document] ১৬টি UI/UX ফিচারের গাইডলাইন
```

---

## ৩. নতুন যুক্ত হওয়া উপাদানগুলোর বিশ্লেষণ (New Components Rationale)

| ফাইল / ফোল্ডার | কেন যুক্ত করা হয়েছে? | কার্যকারিতা ও সুবিধা |
| :--- | :--- | :--- |
| `dashboard.html` | ড্যাশবোর্ড ইউজার ইন্টারফেস প্রদান | পড়ার পরিসংখ্যান, প্রোগ্রেস গ্রাফ এবং ব্যাকআপ কন্ট্রোল এক জায়গায় ব্যবহারের সুযোগ দেয়। |
| `manifest.json` | PWA রূপান্তর | মোবাইল ও ডেস্কটপে সাইটটি ইনস্টল করার অপশন আনে। |
| `sw.js` | সার্ভিস ওয়ার্কার ম্যানেজার | নেটওয়ার্ক না থাকলেও পূর্বে ক্যাশ করা বই পড়ার সুবিধা দেয়। |
| `assets/css/dashboard.css` | ড্যাশবোর্ডের ভিজ্যুয়াল থিম | চার্ট, মিটার এবং স্ট্যাটাস কার্ডগুলোকে দৃষ্টিনন্দন করে তোলে। |
| `assets/css/bot.css` | চ্যাট অ্যাসিস্ট্যান্ট স্টাইল | স্ক্রিনের নিচে ফ্লোটিং চ্যাট উইজেট এবং রেসপন্সিভ পপ-আপ মেসেজিং লেআউট পরিচালনা করে। |
| `assets/js/backup-engine.js` | ডেটা সেফটি ও পোর্টেবিলিটি | `IndexedDB`-এর সমস্ত রেকর্ড এক ক্লিকে ডাউনলোড ও রিস্টোর করার সুবিধা তৈরি করে। |
| `assets/js/dashboard.js` | চার্ট ও অ্যানালিটিক্স লজিক | ব্রাউজারের HTML5 Canvas ব্যবহার করে ডেটা গ্রাফিকাল ফরম্যাটে উপস্থাপন করে। |
| `assets/js/bot.js` | চ্যাটবট ফ্রন্ট-এন্ড কোর | ইউজার কমান্ড পার্সিং, স্বয়ংক্রিয় উত্তর ও ইন্টারঅ্যাকশন নিয়ন্ত্রণ করে। |
| `assets/js/ai-engine.js` | ক্লায়েন্ট-সাইড ইন্টেলিজেন্স | ডাটাবেসের মধ্যে দ্রুত ফজি সার্চ এবং টেক্সট প্রসেসিং সম্পন্ন করে। |
| `assets/js/tts-engine.js` | ভয়েস ন্যারেশন | Web Speech API দিয়ে বইয়ের লেখা ভয়েসে রূপান্তর করে। |
| `assets/js/ui-enhancements.js` | ডায়নামিক রিডিং এনভায়রনমেন্ট | ডার্ক, সেপিয়া ও লাইট থিমের মধ্যে স্যুইচিং নিয়ন্ত্রণ করে। |

---

## ৪. নতুন উপাদানগুলোর অভ্যন্তরীণ গঠন ও তৈরি করার নিয়ম

### ৪.১ ড্যাশবোর্ড মডিউল (`dashboard.html` & `assets/js/dashboard.js`)
* **গঠন:** এটি একটি কাস্টম HTML5 পেজ যাতে বিভিন্ন Canvas ইলিমেন্ট থাকবে।
* **তৈরি পদ্ধতি:**
  ```javascript
  // assets/js/dashboard.js
  document.addEventListener('DOMContentLoaded', async () => {
      const db = await openDatabase();
      renderReadingCharts(db);
      renderStorageStats();
  });

  function renderReadingCharts(db) {
      const canvas = document.getElementById('readingChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      // Simple Native Canvas Bar Chart Logic
      ctx.fillStyle = '#0066cc';
      ctx.fillRect(10, 50, 40, 100); // Sample bar rendering logic
  }
  ```

### ৪.২ ব্যাকআপ ও রিস্টোর ইঞ্জিন (`assets/js/backup-engine.js`)
* **গঠন:** `IndexedDB`-এর ৪টি স্টোর (`drafts`, `chatHistory`, `bookmarks`, `readingStats`) থেকে ডেটা তুলে এনে JSON অবজেক্ট তৈরি করবে।
* **তৈরি পদ্ধতি:**
  ```javascript
  async function exportFullDatabase() {
      const db = await openDatabase();
      const backupData = {
          version: 2.0,
          timestamp: new Date().toISOString(),
          chatHistory: await getAllStoreData(db, 'chatHistory'),
          bookmarks: await getAllStoreData(db, 'bookmarks'),
          readingStats: await getAllStoreData(db, 'readingStats'),
          drafts: await getAllStoreData(db, 'drafts')
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library_backup_${Date.now()}.json`;
      a.click();
  }
  ```

### ৪.৩ অফলাইন PWA ইকোসিস্টেম (`manifest.json` & `sw.js`)
* **`manifest.json` স্ট্যান্ডার্ড:**
  ```json
  {
    "short_name": "BookLibrary",
    "name": "Digital Book Library PWA",
    "icons": [
      {
        "src": "assets/covers/default-cover.png",
        "type": "image/png",
        "sizes": "192x192"
      }
    ],
    "start_url": "./index.html",
    "background_color": "#ffffff",
    "theme_color": "#0066cc",
    "display": "standalone"
  }
  ```
* **`sw.js` ক্যাশিং স্ট্র্যাটেজি:**
  ```javascript
  const CACHE_NAME = 'library-v2-cache';
  const ASSETS_TO_CACHE = [
      './',
      './index.html',
      './reader.html',
      './dashboard.html',
      './assets/css/main.css',
      './assets/css/bot.css',
      './assets/css/dashboard.css',
      './assets/js/app.js',
      './assets/js/db.js',
      './assets/js/bot.js',
      './assets/js/backup-engine.js',
      './assets/js/dashboard.js'
  ];

  self.addEventListener('install', (e) => {
      e.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
      );
  });

  self.addEventListener('fetch', (e) => {
      e.respondWith(
          caches.match(e.request).then((res) => res || fetch(e.request))
      );
  });
  ```

---

## ৫. ডিপ্লয়মেন্ট ও বাস্তবায়ন প্রোটোকল

১. **ব্যাকওয়ার্ড কম্প্যাটিবিলিটি (v1.0 অক্ষুণ্ন রাখা):** পূর্বে বিদ্যমান `index.html`, `reader.html` বা মূল ফাইলগুলোর কোনো বিদ্যমান কোড মোছা যাবে না।
২. **অ্যাসিনক্রোনাস মডিউল লোডিং:** প্রতিটি নতুন JS ফাইল HTML ফাইলে যুক্ত করার সময় অবশ্যই `<script defer src="..."></script>` ব্যবহার করতে হবে।
৩. **গিটহাব পেজেস লাইভ ডিরেক্টরি:** প্রজেক্টের সমস্ত পরিবর্তন সম্পন্ন করার পর `git push origin main` সম্পাদন করলেই কাস্টম ডোমেইন বা GitHub সাবডোমেইনে v2.0 ভার্সনটি তাৎক্ষণিকভাবে লাইভ হবে।