# V2 Source Architecture

This directory is the V2 modular ES6 source architecture defined by the Master Blueprint Document.

```text
src/
├── app.js
├── database/
│   ├── db.js
│   └── StorageManager.js
├── modules/
│   ├── library/
│   │   ├── LibraryController.js
│   │   └── LibraryView.js
│   ├── reader/
│   │   ├── ReaderController.js
│   │   └── ReaderView.js
│   └── editor/
│       ├── EditorController.js
│       ├── TemplateEngine.js
│       └── EditorView.js
└── utils/
    ├── Exporter.js
    └── GithubPublisher.js
```

The existing V1 `assets/js/` implementation remains untouched during this structural phase. The V2 source modules will be migrated/wired incrementally so the live application is not broken by a premature path change.
