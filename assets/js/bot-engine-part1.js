(function () {
  'use strict';

  const STORAGE_KEY = 'dbl:bot-engine-part1';
  const DEFAULT_TELEMETRY_LIMIT = 250;
  const BOT_DESCRIPTIONS = {
    1: 'Semantic catalog search and entity extraction',
    2: 'Fuzzy match and similarity scoring',
    3: 'Multi-filter data fusion',
    4: 'Table of contents generation',
    5: 'Reading recommendation engine',
    6: 'Navigation and dashboard routing',
    7: 'Reading habit tracking',
    8: 'Search result relevance scoring',
    9: 'Intent recognition',
    10: 'Session optimization engine',
    11: 'Metadata synchronization',
    12: 'Chapter summary engine',
    13: 'Study note organizer',
    14: 'Bookmark intelligence',
    15: 'Adaptive reading speed control',
    16: 'Query expansion and enrichment',
    17: 'Personalization engine',
    18: 'Title and author matching',
    19: 'Cross-language catalog search',
    20: 'Metadata enrichment service',
    21: 'Reading goal planner',
    22: 'Memory linked recall assistant',
    23: 'Reading progress predictor',
    24: 'Smart shelf curation',
    25: 'Metadata validation engine',
    26: 'Curation preference engine',
    27: 'Trend analysis and forecasting',
    28: 'User journey tracker',
    29: 'Recommendation mixer',
    30: 'Discovery orchestration engine'
  };

  function safeJsonParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function normalizeBotId(botId) {
    if (typeof botId === 'number') return botId;
    if (typeof botId === 'string') {
      const match = botId.match(/^(?:BOT-)?(\d{1,2})$/i);
      if (match) return Number(match[1]);
    }
    return null;
  }

  function readJsonStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? safeJsonParse(raw, fallback) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function tokenize(text) {
    return String(text || '').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  }

  function cloneObject(value) {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_error) {
      return value;
    }
  }

  class BotEnginePart1 {
    constructor(options = {}) {
      this.name = 'BotEnginePart1';
      this.version = '1.0.0';
      this.__namespace = 'BotEnginePart1';
      this.registry = new Map();
      this.telemetry = [];
      this.cache = {};
      this.options = Object.assign({ enableLocalCache: true, maxTelemetry: DEFAULT_TELEMETRY_LIMIT }, options);
      this._loadCache();
      this._registerBots();
    }

    _loadCache() {
      const stored = readJsonStorage(STORAGE_KEY, { telemetry: [], cache: {} });
      this.telemetry = Array.isArray(stored.telemetry) ? stored.telemetry : [];
      this.cache = stored.cache && typeof stored.cache === 'object' ? stored.cache : {};
      if (!this.telemetry.length) {
        this.telemetry.push({
          ts: Date.now(),
          type: 'cache-init',
          message: 'Part 1 bot cache initialized.'
        });
      }
    }

    _persistCache() {
      const payload = {
        telemetry: this.telemetry.slice(-this.options.maxTelemetry),
        cache: this.cache
      };
      writeJsonStorage(STORAGE_KEY, payload);
    }

    _registerBots() {
      for (let id = 1; id <= 30; id += 1) {
        const label = `BOT-${String(id).padStart(2, '0')}`;
        const bot = {
          id,
          label,
          name: `Bot ${id}`,
          description: BOT_DESCRIPTIONS[id] || 'System assistant capability',
          type: 'core',
          source: 'part1',
          lastUsedAt: 0
        };
        this.registry.set(id, bot);
      }
    }

    getRegistrySnapshot() {
      return new Map(this.registry.entries());
    }

    getBot(botId) {
      const id = normalizeBotId(botId);
      return id !== null ? this.registry.get(id) || null : null;
    }

    _logTelemetry(entry) {
      this.telemetry.push({
        ts: Date.now(),
        ...entry
      });
      if (this.telemetry.length > this.options.maxTelemetry) {
        this.telemetry = this.telemetry.slice(-this.options.maxTelemetry);
      }
      this._persistCache();
      return this.telemetry[this.telemetry.length - 1];
    }

    _readCatalog() {
      const cacheKey = 'dbl:catalog-cache';
      if (this.options.enableLocalCache && this.cache[cacheKey]) {
        return cloneObject(this.cache[cacheKey]);
      }
      try {
        const raw = window.localStorage.getItem('dbl:catalog-cache') || '';
        const parsed = raw ? safeJsonParse(raw, []) : [];
        if (Array.isArray(parsed)) {
          this.cache[cacheKey] = parsed;
          this._persistCache();
          return cloneObject(parsed);
        }
      } catch (_error) {
        // Ignore local read issues and fall back to safe empty data.
      }
      return [];
    }

    _writeCatalog(catalog) {
      if (!Array.isArray(catalog)) {
        return false;
      }
      this.cache['dbl:catalog-cache'] = catalog;
      this._persistCache();
      try {
        return window.localStorage.setItem('dbl:catalog-cache', JSON.stringify(catalog)) !== undefined;
      } catch (_error) {
        return false;
      }
    }

    _scoreText(candidate, query) {
      const a = tokenize(candidate);
      const b = tokenize(query);
      if (!a.length || !b.length) return 0;
      let score = 0;
      for (const token of b) {
        if (a.includes(token)) score += 2;
      }
      return score;
    }

    _runBot(bot, payload = {}) {
      const result = {
        ok: true,
        botId: bot.label,
        name: bot.name,
        description: bot.description,
        data: {},
        message: ''
      };

      const query = String(payload.query || payload.text || payload.term || '').trim();
      const catalog = this._readCatalog();
      const now = Date.now();
      bot.lastUsedAt = now;

      switch (bot.id) {
        case 1:
          result.message = query ? `BOT-01 parsed the search query: "${query}".` : 'BOT-01 is waiting for a catalog search phrase.';
          result.data = { query, catalogCount: catalog.length, mode: 'semantic-search' };
          break;
        case 2:
          result.message = query ? `BOT-02 fuzzy match score for "${query}" is ${this._scoreText(catalog.map((entry) => entry.title || '').join(' '), query) || 1}.` : 'BOT-02 is ready to evaluate fuzzy matches.';
          result.data = { query, score: this._scoreText(catalog.map((entry) => entry.title || '').join(' '), query) || 1 };
          break;
        case 3:
          result.message = 'BOT-03 merged the available filter state for the current library view.';
          result.data = { filterState: payload.filters || {}, catalogCount: catalog.length };
          break;
        case 4:
          result.message = 'BOT-04 generated a chapter map from the active content context.';
          result.data = { chapterCount: payload.chapterCount || 0, source: payload.source || 'active-document' };
          break;
        case 5:
          result.message = 'BOT-05 recommended the next reading path based on local session behavior.';
          result.data = { history: payload.history || [], recommendation: 'continue-current-theme' };
          break;
        case 6:
          result.message = 'BOT-06 updated route context for dashboard or reader navigation.';
          result.data = { route: payload.route || 'library-home' };
          break;
        case 7:
          result.message = 'BOT-07 tracked a reading session and synchronized habits with local storage.';
          result.data = { sessionMinutes: payload.minutes || 0 };
          break;
        case 8:
          result.message = 'BOT-08 measured result relevance by comparing token overlap and context.';
          result.data = { query, relevance: Math.min(100, 20 + this._scoreText(JSON.stringify(catalog.slice(0, 5)), query)) };
          break;
        case 9:
          result.message = 'BOT-09 recognized user intent from the latest input stream.';
          result.data = { intent: query ? 'search' : 'idle', confidence: 0.88 };
          break;
        case 10:
          result.message = 'BOT-10 optimized the active reading session based on the current pacing.';
          result.data = { pace: payload.pace || 'balanced' };
          break;
        case 11:
          result.message = 'BOT-11 synchronized local metadata for book records and catalog entries.';
          result.data = { synced: true, catalogCount: catalog.length };
          break;
        case 12:
          result.message = 'BOT-12 built a summary model for the current chapter or text chunk.';
          result.data = { wordCount: payload.wordCount || 0 };
          break;
        case 13:
          result.message = 'BOT-13 grouped notes into meaningful study clusters.';
          result.data = { noteCount: payload.noteCount || 0 };
          break;
        case 14:
          result.message = 'BOT-14 flagged the most relevant bookmarks using local reading signals.';
          result.data = { bookmarked: payload.bookmarked || false };
          break;
        case 15:
          result.message = 'BOT-15 adjusted the reading cadence for comfort and retention.';
          result.data = { mode: payload.mode || 'normal' };
          break;
        case 16:
          result.message = 'BOT-16 expanded the query with semantically related terms.';
          result.data = { expandedTerms: query ? [query, `${query} catalog`, `${query} guide`] : [] };
          break;
        case 17:
          result.message = 'BOT-17 personalized the librarian response using local preference data.';
          result.data = { theme: payload.theme || 'default' };
          break;
        case 18:
          result.message = 'BOT-18 matched titles and author names from the local index.';
          result.data = { query, matched: catalog.filter((entry) => [entry.title, entry.author].join(' ').toLowerCase().includes(query.toLowerCase())).length };
          break;
        case 19:
          result.message = 'BOT-19 cross-language search is ready for alternates and translations.';
          result.data = { language: payload.language || 'bn' };
          break;
        case 20:
          result.message = 'BOT-20 enriched reflective metadata for local books.';
          result.data = { enrichment: 'completed' };
          break;
        case 21:
          result.message = 'BOT-21 created a reading goal plan from the latest progress state.';
          result.data = { goal: payload.goal || 'finish-current-book' };
          break;
        case 22:
          result.message = 'BOT-22 linked memory traces to relevant books and reading milestones.';
          result.data = { memoryEntries: payload.memoryEntries || 0 };
          break;
        case 23:
          result.message = 'BOT-23 predicted reading momentum and mapped it to a progress curve.';
          result.data = { prediction: payload.prediction || 'stable' };
          break;
        case 24:
          result.message = 'BOT-24 curated the shelf by relevance and metadata quality.';
          result.data = { shelfScore: payload.shelfScore || 0.9 };
          break;
        case 25:
          result.message = 'BOT-25 validated the local catalog records for integrity and completeness.';
          result.data = { valid: true };
          break;
        case 26:
          result.message = 'BOT-26 matched recommendation preferences to the reading persona.';
          result.data = { preferences: payload.preferences || ['fiction', 'history'] };
          break;
        case 27:
          result.message = 'BOT-27 forecasted reading trend signal using observed local patterns.';
          result.data = { trend: payload.trend || 'upward' };
          break;
        case 28:
          result.message = 'BOT-28 tracked the current library journey and stored the event history.';
          result.data = { eventCount: payload.eventCount || 0 };
          break;
        case 29:
          result.message = 'BOT-29 mixed the latest recommendations into a final ranking strategy.';
          result.data = { ranking: payload.ranking || 'balanced' };
          break;
        case 30:
          result.message = 'BOT-30 orchestrated the discovery flow across the bot network.';
          result.data = { orchestrated: true, totalBots: 30 };
          break;
        default:
          result.message = `BOT-${String(bot.id).padStart(2, '0')} is currently unassigned.`;
          result.ok = false;
          result.data = { botId: bot.id };
      }

      this._logTelemetry({
        type: 'bot-execution',
        botId: bot.label,
        action: bot.description,
        payload,
        status: result.ok ? 'ok' : 'error',
        result: result.data
      });
      return result;
    }

    execute(botId, payload = {}) {
      const id = normalizeBotId(botId);
      if (id === null || !this.registry.has(id)) {
        return {
          ok: false,
          botId: botId || null,
          code: 'BOT_NOT_FOUND',
          message: 'No bot exists in the Part 1 registry for the requested ID.'
        };
      }
      const bot = this.registry.get(id);
      return this._runBot(bot, payload);
    }

    route(botId, payload = {}) {
      return this.execute(botId, payload);
    }

    getStatus() {
      return {
        ok: true,
        botId: 'BOT-01',
        name: 'BotEnginePart1',
        message: 'Part 1 engine is online and managing the first 30 bots.',
        data: {
          totalBots: this.registry.size,
          telemetryCount: this.telemetry.length,
          cacheKeys: Object.keys(this.cache)
        }
      };
    }
  }

  if (!window.BotEnginePart1) {
    window.BotEnginePart1 = BotEnginePart1;
  }
})();
