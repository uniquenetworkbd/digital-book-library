import { getBookmarks, saveBookmark, loadReadingStat, saveReadingStat } from './db.js';

const params = new URLSearchParams(window.location.search);
const bookId = params.get('id');
const state = { book: null, chapterIndex: 0, fontSize: 1, altFont: false, night: false, highlights: [], saveTimer: null };
const $ = (selector) => document.querySelector(selector);

function escapeHTML(value = '') { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function formatContent(text = '') { return escapeHTML(text).split(/\n\n+/).map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`).join(''); }
function renderTOC() {
  $('#tocList').innerHTML = state.book.chapters.map((chapter, index) => `<a href="#chapter-${index}" data-index="${index}" class="${index === state.chapterIndex ? 'active' : ''}">${escapeHTML(chapter.title)}</a>`).join('');
  $('#tocList').querySelectorAll('a').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); showChapter(Number(link.dataset.index)); history.replaceState(null, '', `reader.html?id=${encodeURIComponent(bookId)}#chapter-${link.dataset.index}`); }));
}
function getTextOffset(root, node, offset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let total = 0; let current;
  while ((current = walker.nextNode())) { if (current === node) return total + offset; total += current.nodeValue.length; }
  return total;
}
function locateTextOffset(root, target) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let total = 0; let node;
  while ((node = walker.nextNode())) { const end = total + node.nodeValue.length; if (target <= end) return { node, offset: Math.max(0, target - total) }; total = end; }
  return null;
}
function wrapTextOffsetRange(root, startOffset, endOffset, highlightId, color) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const nodes = []; let total = 0; let node;
  while ((node = walker.nextNode())) { const start = total; const end = total + node.nodeValue.length; if (end > startOffset && start < endOffset) nodes.push({ node, start, end }); total = end; }
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const item = nodes[i]; const from = Math.max(0, startOffset - item.start); const to = Math.min(item.node.nodeValue.length, endOffset - item.start);
    if (to <= from) continue;
    const range = document.createRange(); range.setStart(item.node, from); range.setEnd(item.node, to);
    const mark = document.createElement('mark'); mark.className = `reader-highlight highlight-${color || 'yellow'}`; mark.dataset.highlightId = String(highlightId);
    const fragment = range.extractContents(); mark.appendChild(fragment); range.insertNode(mark);
  }
}
function renderHighlights() {
  document.querySelectorAll('.reader-highlight').forEach((node) => node.replaceWith(document.createTextNode(node.textContent || '')));
  state.highlights.filter((item) => item.chapterIndex === state.chapterIndex).sort((a, b) => b.startOffset - a.startOffset).forEach((highlight) => wrapTextOffsetRange($('#chapterContent'), highlight.startOffset, highlight.endOffset, highlight.id, highlight.color));
}
async function loadHighlights() { state.highlights = await getBookmarks(bookId, 'highlight').catch(() => []); }
async function highlightSelection(color = 'yellow') {
  const selection = window.getSelection(); if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
  const range = selection.getRangeAt(0); const root = $('#chapterContent'); if (!root.contains(range.commonAncestorContainer)) return;
  const startOffset = getTextOffset(root, range.startContainer, range.startOffset); const endOffset = getTextOffset(root, range.endContainer, range.endOffset); if (endOffset <= startOffset) return;
  const bookmark = await saveBookmark({ bookId, type: 'highlight', chapterIndex: state.chapterIndex, startOffset, endOffset, color, text: selection.toString().slice(0, 500) });
  state.highlights.push(bookmark); renderHighlights(); selection.removeAllRanges();
}
async function addCurrentBookmark() {
  const existing = await getBookmarks(bookId, 'position').catch(() => []);
  const data = { bookId, type: 'position', chapterIndex: state.chapterIndex, scrollY: Math.round(window.scrollY), title: state.book.chapters[state.chapterIndex].title };
  if (existing[0]?.id) data.id = existing[0].id;
  await saveBookmark(data); showReaderStatus('বুকমার্ক সংরক্ষণ করা হয়েছে।');
}
async function restoreResume() {
  const stat = await loadReadingStat(bookId).catch(() => null); if (!stat || !Number.isFinite(stat.scrollY)) return;
  const chapterIndex = Number.isInteger(stat.chapterIndex) ? stat.chapterIndex : 0;
  if (chapterIndex >= 0 && chapterIndex < state.book.chapters.length) { state.chapterIndex = chapterIndex; showChapter(chapterIndex, false); requestAnimationFrame(() => window.scrollTo({ top: stat.scrollY, behavior: 'auto' })); }
}
function scheduleReadingSave() { clearTimeout(state.saveTimer); state.saveTimer = setTimeout(async () => { await saveReadingStat(bookId, { chapterIndex: state.chapterIndex, scrollY: Math.round(window.scrollY), lastReadAt: new Date().toISOString() }).catch((error) => console.warn('Reading position save failed:', error)); }, 500); }
function showReaderStatus(message) { const el = $('#readerStatus'); if (el) el.textContent = message; }
function showChapter(index, updateHistory = true) {
  const chapters = state.book.chapters; if (!chapters[index]) return; state.chapterIndex = index; const chapter = chapters[index];
  $('#chapterContent').innerHTML = `<h2>${escapeHTML(chapter.title)}</h2>${formatContent(chapter.content)}`; $('#previousChapter').disabled = index === 0; $('#nextChapter').disabled = index === chapters.length - 1;
  $('#tocList').querySelectorAll('a').forEach((link) => link.classList.toggle('active', Number(link.dataset.index) === index)); renderHighlights(); window.scrollTo({ top: 0, behavior: 'auto' });
  if (updateHistory) history.replaceState(null, '', `reader.html?id=${encodeURIComponent(bookId)}#chapter-${index}`); scheduleReadingSave();
}
function applyReaderSettings() {
  const root = document.querySelector('.reader-layout'); root.style.setProperty('--reader-font-scale', state.fontSize); $('#chapterContent').style.fontSize = `${state.fontSize}em`; root.classList.toggle('night', state.night); document.querySelector('.reader-main').classList.toggle('font-alt', state.altFont);
  localStorage.setItem('reader-local-font-scale', String(state.fontSize)); localStorage.setItem('reader-alt-font', String(state.altFont));
}
async function loadBook() {
  if (!bookId) throw new Error('Book id is missing.'); const catalogResponse = await fetch('data/catalog.json', { cache: 'no-store' }); if (!catalogResponse.ok) throw new Error('Catalog could not be loaded.');
  const catalog = await catalogResponse.json(); const entry = catalog.find((item) => item.id === bookId); if (!entry) throw new Error('বইটি ক্যাটালগে পাওয়া যায়নি.');
  const response = await fetch(entry.filePath, { cache: 'no-store' }); if (!response.ok) throw new Error('বইয়ের JSON ফাইল লোড করা যায়নি।'); state.book = await response.json();
  $('#bookTitle').textContent = state.book.title; $('#bookAuthor').textContent = `লেখক: ${state.book.author}`; $('#bookCategory').textContent = state.book.category; renderTOC(); await loadHighlights();
  const hashIndex = Number(location.hash.replace('#chapter-', '')); const initialIndex = Number.isInteger(hashIndex) && hashIndex >= 0 ? hashIndex : 0; showChapter(initialIndex, false); await restoreResume(); applyReaderSettings();
}
$('#previousChapter').addEventListener('click', () => showChapter(state.chapterIndex - 1)); $('#nextChapter').addEventListener('click', () => showChapter(state.chapterIndex + 1));
$('#fontDecrease').addEventListener('click', () => { state.fontSize = Math.max(.85, state.fontSize - .1); applyReaderSettings(); }); $('#fontIncrease').addEventListener('click', () => { state.fontSize = Math.min(1.6, state.fontSize + .1); applyReaderSettings(); });
$('#fontToggle').addEventListener('click', () => { state.altFont = !state.altFont; applyReaderSettings(); }); $('#nightToggle').addEventListener('click', () => { state.night = !state.night; applyReaderSettings(); });
$('#bookmarkButton')?.addEventListener('click', addCurrentBookmark); $('#highlightButton')?.addEventListener('click', () => highlightSelection('yellow')); window.addEventListener('scroll', scheduleReadingSave, { passive: true });
loadBook().catch((error) => { console.error(error); showReaderStatus(error.message); });
