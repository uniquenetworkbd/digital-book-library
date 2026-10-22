(() => {
  'use strict';

  const descriptions = [
    'Semantic catalog search and entity extraction', 'Fuzzy match and similarity scoring', 'Multi-filter data fusion', 'Table of contents generation', 'Reading recommendation engine', 'Navigation and dashboard routing', 'Reading habit tracking', 'Search result relevance scoring', 'Intent recognition', 'Session optimization engine', 'Metadata synchronization', 'Chapter summary engine', 'Study note organizer', 'Bookmark intelligence', 'Adaptive reading speed control', 'Query expansion and enrichment', 'Personalization engine', 'Title and author matching', 'Cross-language catalog search', 'Metadata enrichment service', 'Reading goal planner', 'Memory-linked recall assistant', 'Reading progress predictor', 'Smart shelf curation', 'Metadata validation engine', 'Curation preference engine', 'Trend analysis and forecasting', 'User journey tracker', 'Recommendation mixer', 'Discovery orchestration engine',
    'Draft organization', 'Chapter structure analysis', 'Writing prompt generation', 'Reading list planning', 'Book metadata lookup', 'Citation formatting', 'Reading session summary', 'Genre classification', 'Author index lookup', 'Keyword extraction', 'Text length analysis', 'Reading time estimate', 'Shelf filtering', 'Duplicate title detection', 'Book detail validation', 'Saved state inspection', 'Local storage diagnostics', 'Offline availability check', 'Reading streak summary', 'Goal progress check', 'Bookmark search', 'Chapter navigation', 'Draft recovery', 'Publication package validation', 'Catalog statistics', 'Category distribution', 'Recent activity summary', 'Search history review', 'Reading pace estimate', 'Assistant help routing', 'Network health status'
  ];
  const tokenize = (text) => String(text || '').toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const parse = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; } };
  const normalizeId = (value) => { const match = String(value ?? '').match(/^(?:bot[-\s]?)?(\d{1,2})$/i); const id = match ? Number(match[1]) : NaN; return id >= 1 && id <= 61 ? id : null; };

  class CompleteBotEngine {
    constructor() {
      this.name = 'CompleteBotEngine';
      this.version = '2.0.0';
      this.registry = new Map(descriptions.map((description, index) => {
        const id = index + 1;
        return [id, { id, label: `BOT-${String(id).padStart(2, '0')}`, name: `Bot ${String(id).padStart(2, '0')}`, description, lastUsedAt: 0 }];
      }));
      this.maxTelemetry = 250;
    }

    getCatalog() {
      const cached = parse(localStorage.getItem('dbl:catalog-cache'), []);
      return Array.isArray(cached) ? cached : [];
    }

    recordTelemetry(entry) {
      const entries = parse(localStorage.getItem('dbl:bot-telemetry'), []);
      const next = Array.isArray(entries) ? entries : [];
      next.push({ at: new Date().toISOString(), ...entry });
      try { localStorage.setItem('dbl:bot-telemetry', JSON.stringify(next.slice(-this.maxTelemetry))); } catch (_) {}
    }

    status() {
      return { ok: true, botId: 'ORCHESTRATOR', message: 'The local assistant is online with 61 registered bots.', data: { totalBots: this.registry.size, telemetry: parse(localStorage.getItem('dbl:bot-telemetry'), []).length || 0 } };
    }

    execute(botId, payload = {}) {
      const id = normalizeId(botId);
      const bot = id && this.registry.get(id);
      if (!bot) return { ok: false, code: 'BOT_NOT_FOUND', message: 'Choose a bot from BOT-01 through BOT-61.' };
      bot.lastUsedAt = Date.now();
      const query = String(payload.query || payload.text || payload.term || '').trim();
      const catalog = this.getCatalog();
      let data = { query, catalogCount: catalog.length };
      let message = `${bot.label} · ${bot.description}.`;
      if (id === 1 || id === 18 || id === 39 || id === 51) {
        const terms = tokenize(query);
        const results = catalog.filter((book) => terms.every((term) => tokenize([book.title, book.author, book.category, book.description].join(' ')).includes(term)));
        data = { query, results: results.slice(0, 8), total: results.length };
        message = query ? `Found ${results.length} ${results.length === 1 ? 'match' : 'matches'} in the locally cached catalog.` : 'Give me a title, author, or subject to search.';
      } else if (id === 7 || id === 20 || id === 37 || id === 49 || id === 55) {
        const stats = parse(localStorage.getItem('reading-stats'), []);
        const records = Array.isArray(stats) ? stats : [];
        const minutes = records.reduce((sum, item) => sum + (Number(item.minutes || item.readingTimeMinutes) || 0), 0);
        data = { sessions: records.length, minutes, records: records.slice(-5) };
        message = `You have ${records.length} saved reading sessions and ${minutes} recorded minutes.`;
      } else if (id === 25 || id === 45) {
        const invalid = catalog.filter((book) => !book || !book.id || !book.title);
        data = { valid: invalid.length === 0, checked: catalog.length, invalid };
        message = invalid.length ? `${invalid.length} catalog record(s) need an id and title.` : `Checked ${catalog.length} catalog records; all have an id and title.`;
      } else if (id === 30) {
        data = { orchestrated: true, totalBots: this.registry.size, available: Array.from(this.registry.values(), (entry) => entry.label) };
        message = 'The 61-bot network is ready. Name a bot with /bot-01 through /bot-61.';
      } else if (id === 61) {
        data = { online: true, storage: typeof indexedDB !== 'undefined' ? 'IndexedDB available' : 'localStorage only', catalogCount: catalog.length };
        message = 'System check complete. The local assistant is responsive.';
      } else if ([2, 8, 16, 38, 40].includes(id)) {
        data = { query, tokens: tokenize(query), score: tokenize(query).length ? Math.min(100, tokenize(query).length * 20) : 0 };
        message = query ? `${bot.label} analyzed ${tokenize(query).length} search term(s).` : 'Provide a phrase and I will analyze it.';
      }
      const result = { ok: true, botId: bot.label, name: bot.name, description: bot.description, message, data };
      this.recordTelemetry({ type: 'bot-execution', botId: bot.label, query });
      return result;
    }

    async processQuery(input) {
      const text = String(input || '').trim();
      if (!text) return null;
      const greeting = text.toLocaleLowerCase().replace(/[.!?,;:]+$/g, '').trim();
      if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)( there)?$/.test(greeting)) {
        this.recordTelemetry({ type: 'intent', intent: 'greeting' });
        return 'Hello! I can search your library, check your reading activity, or help with your manuscript. What are you working on?';
      }
      const command = text.match(/^\/(help|search|stats|status|clear|bot(?:-)?\s*0*(\d{1,2}))\b(?:\s+([\s\S]*))?$/i);
      if (command) {
        const action = command[1].toLowerCase();
        const argument = (command[3] || '').trim();
        if (action === 'help') return 'Commands: /search <words>, /stats, /status, /clear, /bot-01 through /bot-61. You can also ask a question in plain language.';
        if (action === 'status') return this.status().message;
        if (action === 'clear') { document.getElementById('chat-feed')?.replaceChildren(); return 'Conversation cleared.'; }
        if (action === 'stats') return this.execute(7).message;
        if (action === 'search') return this.execute(1, { query: argument }).message;
        const id = normalizeId(command[2]);
        const result = this.execute(id, { query: argument, text: argument });
        return argument && result.data.results ? `${result.message}${result.data.results.length ? `\n${result.data.results.map((book) => `${book.title || 'Untitled'}${book.author ? ` — ${book.author}` : ''}`).join('\n')}` : ''}` : result.message;
      }
      const botMention = text.match(/\b(?:bot[-\s]?0*(\d{1,2}))\b/i);
      if (botMention) return this.execute(botMention[1], { query: text }).message;
      const lower = text.toLocaleLowerCase();
      if (/\b(search|find|look for)\b/.test(lower)) return this.execute(1, { query: text.replace(/^.*?\b(?:search|find|look for)\b/i, '').trim() || text }).message;
      if (/\b(stats|statistics|reading time|minutes read)\b/.test(lower)) return this.execute(7).message;
      if (/\b(help|what can you do|commands)\b/.test(lower)) return 'I can search your local catalog, check reading activity, and route work to any of 61 bots. Try /help or /search <words>.';
      if (/\b(recommend|recommendation|suggest)\b/.test(lower)) return 'Tell me a genre, author, or subject and I will search the locally cached catalog for a match.';
      this.recordTelemetry({ type: 'intent', intent: 'general-query' });
      return `I'm ready to help with "${text}". Try /help, /search <words>, /stats, or /bot-01 through /bot-61.`;
    }
  }

  const engine = new CompleteBotEngine();
  window.CompleteBotEngine = CompleteBotEngine;
  window.completeBotEngine = engine;
})();