# IndexedDB V1 → V2 Migration Contract

## Scope

`LibraryAuthoringDB` is upgraded from version `1` to version `2` in place. The migration is browser-native and runs through IndexedDB's `onupgradeneeded` lifecycle.

## Compatibility rule

V1 created the `drafts` object store with `keyPath: "id"`. V2 preserves that exact key contract. Existing V1 draft records are therefore retained; V2 does not rename the key to `bookId` and does not delete or rewrite existing drafts during schema upgrade.

## V2 stores

| Store | Key | Purpose |
|---|---|---|
| `drafts` | `id` | Existing V1 authoring drafts |
| `chatHistory` | auto-increment `id` | Local assistant conversation records |
| `bookmarks` | auto-increment `id` | Position bookmarks and text highlights |
| `readingStats` | `id` | Per-book reading position and telemetry |

## Indexes

- `chatHistory.bookId`
- `chatHistory.createdAt`
- `bookmarks.bookId`
- `bookmarks.type`
- `bookmarks.updatedAt`
- `readingStats.bookId`
- `readingStats.updatedAt`

## Upgrade safety

- Upgrade is blocked with a user-facing error when another database connection prevents version change.
- Successful database connections close themselves on future `versionchange` events so another tab can upgrade safely.
- Existing `drafts` are not migrated into a different key structure.
- V2 writes are transactional.

## Runtime API

`assets/js/db.js` exposes the V2 operations used by the application:

- `initDB()`
- `saveDraft()` / `loadDraft()`
- `saveBookmark()` / `getBookmarks()` / `deleteBookmark()`
- `saveReadingStat()` / `loadReadingStat()`
- `addChatMessage()` / `getChatHistory()`
- `createAutoSaver()`

## Verification boundary

Source-level verification confirms the V2 schema, key preservation and transactional implementation. Browser runtime verification still requires a real browser session with an existing V1 database, including upgrade, draft preservation, bookmark/highlight persistence and offline/PWA checks.
