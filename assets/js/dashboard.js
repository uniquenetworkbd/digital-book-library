/* Digital Book Library Dashboard Metrics */
(function () {
  'use strict';

  function safeJsonParse(value, fallback) {
    try {
      const parsed = JSON.parse(value || 'null');
      return parsed ?? fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function numericValue(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  }

  function getReadingStats() {
    const readingStat = safeJsonParse(localStorage.getItem('dbl_reading_stat'), {});
    const minutes = numericValue(readingStat.minutes || readingStat.readMinutes || 0, 0);
    return {
      hours: (minutes / 60).toFixed(1),
      drafts: safeJsonParse(localStorage.getItem('dbl_drafts'), []).length,
      bookmarks: safeJsonParse(localStorage.getItem('dbl_bookmarks'), []).length,
      chat: safeJsonParse(localStorage.getItem('dbl_bot_logs'), []).length
    };
  }

  function drawTrendChart() {
    const el = document.getElementById('readingTrendChart');
    if (!el) return;
    const values = [32, 46, 38, 56, 72, 68];
    el.innerHTML = values.map((value) => '<span style="height:' + value + '%"></span>').join('');
  }

  function drawCategoryChart() {
    const el = document.getElementById('categoryChart');
    if (!el) return;
    const values = [76, 54, 44, 36];
    el.innerHTML = values.map((value) => '<span style="height:' + value + '%"></span>').join('');
  }

  async function updateMetrics() {
    const stats = getReadingStats();
    setText('readingHours', stats.hours + 'h');
    setText('draftCount', String(stats.drafts));
    setText('bookmarkCount', String(stats.bookmarks));
    setText('chatLogCount', String(stats.chat));

    const totalBooks = safeJsonParse(localStorage.getItem('dbl_library_catalog'), []).length || 230;
    setText('totalBooksMetric', String(totalBooks));
    setText('readingHoursMetric', stats.hours + 'h');
    setText('streakMetric', '12 days');
    drawTrendChart();
    drawCategoryChart();
  }

  document.addEventListener('DOMContentLoaded', updateMetrics);
})();
