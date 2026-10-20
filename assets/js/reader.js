const params = new URLSearchParams(window.location.search);
const bookId = params.get('id');
const state = { book: null, chapterIndex: 0, fontSize: 1, altFont: false, night: false };
const $ = (selector) => document.querySelector(selector);

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function formatContent(text = '') {
  return escapeHTML(text).split(/\n\n+/).map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`).join('');
}
function renderTOC() {
  $('#tocList').innerHTML = state.book.chapters.map((chapter, index) => `<a href="#chapter-${index}" data-index="${index}" class="${index === state.chapterIndex ? 'active' : ''}">${escapeHTML(chapter.title)}</a>`).join('');
  $('#tocList').querySelectorAll('a').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showChapter(Number(link.dataset.index));
    history.replaceState(null, '', `reader.html?id=${encodeURIComponent(bookId)}#chapter-${link.dataset.index}`);
  }));
}
function showChapter(index) {
  const chapters = state.book.chapters;
  if (!chapters[index]) return;
  state.chapterIndex = index;
  const chapter = chapters[index];
  $('#chapterContent').innerHTML = `<h2>${escapeHTML(chapter.title)}</h2>${formatContent(chapter.content)}`;
  $('#previousChapter').disabled = index === 0;
  $('#nextChapter').disabled = index === chapters.length - 1;
  $('#tocList').querySelectorAll('a').forEach((link) => link.classList.toggle('active', Number(link.dataset.index) === index));
}
function applyReaderSettings() {
  const root = document.querySelector('.reader-layout');
  root.style.setProperty('--reader-font-scale', state.fontSize);
  $('#chapterContent').style.fontSize = `${state.fontSize}em`;
  root.classList.toggle('night', state.night);
  $('#reader-main')?.classList.toggle('font-alt', state.altFont);
  document.querySelector('.reader-main').classList.toggle('font-alt', state.altFont);
}
async function loadBook() {
  if (!bookId) throw new Error('Book id is missing.');
  const catalogResponse = await fetch('data/catalog.json', { cache: 'no-store' });
  if (!catalogResponse.ok) throw new Error('Catalog could not be loaded.');
  const catalog = await catalogResponse.json();
  const entry = catalog.find((item) => item.id === bookId);
  if (!entry) throw new Error('বইটি ক্যাটালগে পাওয়া যায়নি।');
  const response = await fetch(entry.filePath, { cache: 'no-store' });
  if (!response.ok) throw new Error('বইয়ের JSON ফাইল লোড করা যায়নি।');
  state.book = await response.json();
  $('#bookTitle').textContent = state.book.title;
  $('#bookAuthor').textContent = `লেখক: ${state.book.author}`;
  $('#bookCategory').textContent = state.book.category;
  renderTOC();
  const hashIndex = Number(location.hash.replace('#chapter-', ''));
  showChapter(Number.isInteger(hashIndex) && hashIndex >= 0 ? hashIndex : 0);
}

$('#previousChapter').addEventListener('click', () => showChapter(state.chapterIndex - 1));
$('#nextChapter').addEventListener('click', () => showChapter(state.chapterIndex + 1));
$('#fontDecrease').addEventListener('click', () => { state.fontSize = Math.max(.85, state.fontSize - .1); applyReaderSettings(); });
$('#fontIncrease').addEventListener('click', () => { state.fontSize = Math.min(1.6, state.fontSize + .1); applyReaderSettings(); });
$('#fontToggle').addEventListener('click', () => { state.altFont = !state.altFont; applyReaderSettings(); });
$('#nightToggle').addEventListener('click', () => { state.night = !state.night; applyReaderSettings(); });

loadBook().catch((error) => { console.error(error); $('#readerStatus').textContent = error.message; });
