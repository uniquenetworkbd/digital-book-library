/**
 * Digital Book Library v2.0 — Client-side AI & Bot Command Engine
 * Offline-first command parser with catalog/search and IndexedDB-aware hooks.
 */

class AIBotEngine {
  constructor() {
    this.commands = new Map();
    this.registerDefaultCommands();
  }

  registerDefaultCommands() {
    this.commands.set('/search', this.handleSearch.bind(this));
    this.commands.set('/clear', this.handleClear.bind(this));
    this.commands.set('/help', this.handleHelp.bind(this));
    this.commands.set('/stats', this.handleStats.bind(this));
  }

  async processQuery(rawInput) {
    const input = String(rawInput || '').trim();
    if (!input) return null;

    if (input.startsWith('/')) {
      const parts = input.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(' ');
      if (this.commands.has(cmd)) return this.commands.get(cmd)(args);
      return `Unknown command "${cmd}". Type /help for available commands.`;
    }

    return this.fallbackNLP(input);
  }

  async handleSearch(query) {
    if (!query) return 'Please specify a keyword. Example: /search Fiction';
    try {
      const response = await fetch('data/catalog.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
      const catalog = await response.json();
      const books = Array.isArray(catalog) ? catalog : (Array.isArray(catalog.books) ? catalog.books : []);
      const term = query.toLowerCase();
      const matches = books.filter((book) => JSON.stringify(book).toLowerCase().includes(term));
      if (!matches.length) return `No local catalog matches found for "${query}".`;
      return `Found ${matches.length} local catalog match${matches.length === 1 ? '' : 'es'} for "${query}".`;
    } catch (error) {
      console.warn('Catalog search fallback:', error);
      return `Catalog search is currently unavailable offline for "${query}".`;
    }
  }

  async handleClear() {
    const msgBox = document.getElementById('bot-messages');
    if (msgBox) msgBox.replaceChildren();
    return null;
  }

  async handleHelp() {
    return 'Available Slash Commands:\n- /search <keyword>\n- /stats (View Reading Stats)\n- /clear (Clear Chat Window)\n- /help (Show Commands)';
  }

  async handleStats() {
    const stats = localStorage.getItem('reading-stats');
    return stats ? `Reading Stats: ${stats}` : 'Reading statistics are not available yet.';
  }

  async fallbackNLP(text) {
    const lower = text.toLowerCase();
    if (lower.includes('recommend') || lower.includes('suggest')) {
      return 'Recommendation engine is ready for local catalog/history integration.';
    }
    if (lower.includes('hello') || lower.includes('hi')) {
      return 'Hello! How can I assist your reading or writing session today?';
    }
    return `I processed your query: "${text}". Use /help to see executable commands.`;
  }
}

window.aiEngine = new AIBotEngine();
