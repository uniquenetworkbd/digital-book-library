/**
 * Digital Book Library v2.0 — UI/UX Enhancement Engine
 * Handles theme, typography, reading progress, time estimation and live counters.
 */

class UIEngine {
  constructor() {
    this.initTheme();
    this.restoreTypography();
    this.initReadingProgress();
    this.initLiveCounters();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('app-theme') || 'sepia';
    this.applyTheme(savedTheme);
    document.querySelectorAll('[data-theme-trigger]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        this.applyTheme(event.currentTarget.dataset.themeTrigger);
      });
    });
  }

  applyTheme(theme) {
    const allowed = ['dark', 'light', 'sepia'];
    const selected = allowed.includes(theme) ? theme : 'sepia';
    document.documentElement.setAttribute('data-theme', selected);
    localStorage.setItem('app-theme', selected);
  }

  setFontSize(sizePx) {
    const size = Number(sizePx);
    if (!Number.isFinite(size) || size <= 0) return;
    const readerContent = document.getElementById('reader-content') || document.getElementById('chapterContent');
    if (readerContent) readerContent.style.fontSize = `${size}px`;
    document.documentElement.style.setProperty('--reader-font-size', `${size}px`);
    localStorage.setItem('reader-font-size', String(size));
  }

  restoreTypography() {
    const savedSize = Number(localStorage.getItem('reader-font-size'));
    if (Number.isFinite(savedSize) && savedSize > 0) this.setFontSize(savedSize);
  }

  initReadingProgress() {
    const readerContent = document.getElementById('reader-content') || document.getElementById('chapterContent');
    const progressBar = document.getElementById('reading-progress-bar');
    const timeEstimateEl = document.getElementById('reading-time-estimate');
    if (!readerContent) return;

    const updateProgress = () => {
      const totalHeight = readerContent.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const percentage = totalHeight > 0
        ? Math.min(100, Math.max(0, (scrolled / totalHeight) * 100))
        : 0;
      if (progressBar) progressBar.style.width = `${percentage}%`;
      localStorage.setItem('reader-progress', percentage.toFixed(2));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    if (timeEstimateEl) {
      const text = readerContent.innerText || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const minutes = Math.ceil(words / 200);
      timeEstimateEl.textContent = `~${minutes} min read`;
    }
  }

  initLiveCounters() {
    const editorTextarea = document.getElementById('editor-textarea') || document.getElementById('chapterContent');
    const wordCountEl = document.getElementById('live-word-count');
    const charCountEl = document.getElementById('live-char-count');
    if (!editorTextarea) return;

    const update = () => {
      const text = editorTextarea.value || '';
      const charCount = text.length;
      const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
      if (wordCountEl) wordCountEl.textContent = String(wordCount);
      if (charCountEl) charCountEl.textContent = String(charCount);
    };

    editorTextarea.addEventListener('input', update);
    update();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.uiEngine = new UIEngine();
});
