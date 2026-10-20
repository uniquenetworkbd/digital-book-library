const state = { books: [], query: '', category: 'all' };
const grid = document.querySelector('#bookGrid');
const status = document.querySelector('#catalogStatus');
const searchInput = document.querySelector('#searchInput');
const categoryFilter = document.querySelector('#categoryFilter');

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function getFilteredBooks() {
  const query = state.query.trim().toLowerCase();
  return state.books.filter((book) => {
    const matchesQuery = !query || `${book.title} ${book.author}`.toLowerCase().includes(query);
    const matchesCategory = state.category === 'all' || book.category === state.category;
    return matchesQuery && matchesCategory;
  });
}

function render() {
  const books = getFilteredBooks();
  status.textContent = `${books.length}টি বই পাওয়া গেছে`;
  if (!books.length) {
    grid.innerHTML = '<p class="status">এই অনুসন্ধানে কোনো বই পাওয়া যায়নি।</p>';
    return;
  }
  grid.innerHTML = books.map((book) => `
    <article class="book-card">
      <div class="book-cover" aria-label="বইয়ের কভার">📖</div>
      <div class="book-card-body">
        <p class="eyebrow">${escapeHTML(book.category)}</p>
        <h2>${escapeHTML(book.title)}</h2>
        <p>লেখক: ${escapeHTML(book.author)}</p>
        <p>${escapeHTML(book.publishDate || '')}</p>
        <a class="read-button" href="reader.html?id=${encodeURIComponent(book.id)}">Read Now</a>
      </div>
    </article>`).join('');
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

searchInput.addEventListener('input', (event) => { state.query = event.target.value; render(); });
categoryFilter.addEventListener('change', (event) => { state.category = event.target.value; render(); });
loadCatalog();
