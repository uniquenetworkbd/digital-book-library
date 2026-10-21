/* Digital Book Library v2.0 — Theme and reading UI engine scaffold. */
(function () {
  'use strict';
  window.DigitalBookLibraryUI = {
    version: 2,
    setTheme: function (theme) {
      document.documentElement.dataset.theme = theme;
    },
    setFontSize: function (size) {
      document.documentElement.style.setProperty('--reader-font-size', size);
    }
  };
})();
