/* Digital Book Library v2.0 — Backup engine scaffold.
 * Full IndexedDB v2 export/restore will be implemented after the storage migration contract is finalized.
 */
(function () {
  'use strict';

  window.DigitalBookLibraryBackup = {
    version: 2,
    exportFullDatabase: async function () {
      throw new Error('V2 backup export is not implemented yet.');
    },
    restoreDatabase: async function () {
      throw new Error('V2 backup restore is not implemented yet.');
    }
  };
})();
