# Digital Book Library

GitHub Pages-এর জন্য তৈরি browser-based Digital Book Library ও Book Authoring platform। এই implementation-এ `docs/01.1-system-overview-and-purpose.md`-এর ১.২ structure-কে final project structure হিসেবে অনুসরণ করা হয়েছে।

## Final project structure

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
        ├── book-001.json
        └── book-002.json
```

## Implemented modules

- **Library:** `catalog.json` fetch, dynamic cards, real-time title/author search, Literature/Technical/Novel filtering and `reader.html?id=...` navigation.
- **Reader:** book JSON loading, table of contents, chapter navigation, previous/next controls, font size controls, alternate font and night mode.
- **Creator:** Novel/Technical template loading, Research fallback structure, chapter add/delete/rename, drag-and-drop ordering, writing/formatting controls, live preview and JSON export.
- **Local drafts:** `LibraryAuthoringDB` + `drafts` IndexedDB store with 3-second debounce autosave and draft recovery prompt.
- **Publishing:** Exported JSON and a `Publish to Library` package that generates the catalog entry and target book path required by the manual GitHub workflow.

## Data model

Published books follow the schema documented in `docs/02-database-and-storage-design/02.1-books-json-and-catalog-json-schema-design.md`: `data/catalog.json` stores metadata and `data/books/*.json` stores book chapters/content.

## Deployment

GitHub Pages-এর Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/ (root)` নির্বাচন করে deploy করা যাবে।

## Documentation

The complete planning documentation is under `docs/`, including architecture, data/storage, library/reader, creator/editor, deployment, publishing workflow, maintenance and security guidance.
