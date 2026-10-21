# V2 Architectural Map

This document records the live structural migration for Digital Book Library V2.

## Principle

The V2 architecture is being introduced directly on `main`. Existing V1 runtime files remain in place until their V2 replacements are implemented, wired, tested, and verified.

## Current structural additions

- PWA foundation: `manifest.json`, `sw.js`
- V2 image assets: `assets/images/`
- V2 template expansion: `assets/templates/research.json`
- Published-book target: `data/published/`
- V2 modular source root: `src/`
- Master Blueprint: `docs/Master-Blueprint-Document-v2.0.md`

## Migration rule

Do not remove or relocate the existing `assets/js/` runtime merely to make the tree look like V2. Each module must be migrated with dependency, data-schema, UI, and regression verification before the legacy implementation is retired.
