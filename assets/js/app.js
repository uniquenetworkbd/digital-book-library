const state = { books: [], query: '', category: 'all', tags: '', sort: 'title-asc', page: 1, pageSize: 12 };
const grid = document.querySelector('#bookGrid');
const status = document.querySelector('#catalogStatus');
const searchInput = document.querySelector('#searchInput');
const categoryFilter = document.querySelector('#categoryFilter');
const tagFilter = document.querySelector('#tagFilter');
const sortFilter = document.querySelector('#sortFilter');

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function normalizedTags(book) {
  const values = Array.isArray(book.tags) ? book.tags : (book.tags ? String(book.tags).split(',') : []);
  return values.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
}

function getFilteredBooks() {
  const query = state.query.trim().toLowerCase();
  const requiredTags = state.tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  return state.books.filter((book) => {
    const searchable = `${book.title || ''} ${book.author || ''} ${book.category || ''} ${normalizedTags(book).join(' ')}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesCategory = state.category === 'all' || book.category === state.category;
    const bookTags = normalizedTags(book);
    const matchesTags = !requiredTags.length || requiredTags.every((tag) => bookTags.includes(tag));
    return matchesQuery && matchesCategory && matchesTags;
  });
}

function sortBooks(books) {
  const result = [...books];
  const title = (book) => String(book.title || '').toLocaleLowerCase();
  const date = (book) => Date.parse(book.publishDate || '') || 0;
  const rating = (book) => Number(book.rating) || 0;
  const readingTime = (book) => Number(book.readingTimeMinutes ?? book.readingTime ?? 0) || 0;
  const compareText = (a, b) => title(a).localeCompare(title(b), undefined, { numeric: true, sensitivity: 'base' });
  switch (state.sort) {
    case 'title-desc': return result.sort((a, b) => compareText(b, a));
    case 'date-desc': return result.sort((a, b) => date(b) - date(a));
    case 'date-asc': return result.sort((a, b) => date(a) - date(b));
    case 'rating-desc': return result.sort((a, b) => rating(b) - rating(a) || compareText(a, b));
    case 'readingTime-asc': return result.sort((a, b) => readingTime(a) - readingTime(b) || compareText(a, b));
    default: return result.sort(compareText);
  }
}

function getVisibleBooks() {
  return sortBooks(getFilteredBooks()).slice(0, state.page * state.pageSize);
}

function render() {
  const filtered = getFilteredBooks();
  const books = getVisibleBooks();
  status.textContent = `${filtered.length}টি বই পাওয়া গেছে • ${books.length}টি প্রদর্শিত`;
  if (!books.length) {
    grid.innerHTML = '<p class="status">এই অনুসন্ধানে কোনো বই পাওয়া যায়নি।</p>';
    return;
  }
  grid.innerHTML = books.map((book) => {
    const tags = normalizedTags(book).slice(0, 4).map((tag) => `<span class="tag-chip">${escapeHTML(tag)}</span>`).join('');
    const cover = book.coverImage ? `<img src="${escapeHTML(book.coverImage)}" alt="${escapeHTML(book.title)} কভার" loading="lazy">` : '📖';
    return `<article class="book-card">
      <div class="book-cover" aria-label="বইয়ের কভার">${cover}</div>
      <div class="book-card-body">
        <p class="eyebrow">${escapeHTML(book.category)}</p>
        <h2>${escapeHTML(book.title)}</h2>
        <p>লেখক: ${escapeHTML(book.author)}</p>
        <p>${escapeHTML(book.publishDate || '')}</p>
        <div class="book-tags">${tags}</div>
        <a class="read-button" href="reader.html?id=${encodeURIComponent(book.id)}">Read Now</a>
      </div>
    </article>`;
  }).join('');
  if (books.length < filtered.length) {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'load-more';
    more.textContent = 'আরও বই লোড করুন';
    more.addEventListener('click', () => { state.page += 1; render(); });
    grid.appendChild(more);
  }
}

async function loadCatalog() {
  try {
    const response = await fetch('data/catalog.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
    const catalog = await response.json();
    if (!Array.isArray(catalog)) throw new Error('Catalog must be an array.');
    state.books = catalog;
    render();
  } catch (error) {
    console.error(error);
    status.textContent = 'ক্যাটালগ লোড করা যায়নি।';
    grid.innerHTML = '<p class="status">data/catalog.json পরীক্ষা করুন এবং আবার চেষ্টা করুন।</p>';
  }
}

function resetPageAndRender() { state.page = 1; render(); }
searchInput?.addEventListener('input', (event) => { state.query = event.target.value; resetPageAndRender(); });
categoryFilter?.addEventListener('change', (event) => { state.category = event.target.value; resetPageAndRender(); });
tagFilter?.addEventListener('input', (event) => { state.tags = event.target.value; resetPageAndRender(); });
sortFilter?.addEventListener('change', (event) => { state.sort = event.target.value; resetPageAndRender(); });
loadCatalog();
