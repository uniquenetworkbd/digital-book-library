/* Digital Book Library v2.1-E — lightweight client-side security helpers. */
(function () {
  'use strict';

  function sanitizeHTML(value) {
    if (!value) return '';
    const temp = document.createElement('div');
    temp.textContent = String(value);
    return temp.innerHTML;
  }

  window.DigitalBookLibrarySecurity = Object.freeze({ sanitizeHTML });
})();
