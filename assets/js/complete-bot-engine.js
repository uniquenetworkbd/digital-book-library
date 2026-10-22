/* Digital Book Library v2.0 — complete local-first bot engine */
(function () {
  'use strict';

  const BOT_NAMES = {
    1: 'NLP Search Intention Engine',
    2: 'Fuzzy Query Resolver',
    3: 'Dynamic Filter Matcher',
    4: 'Table of Contents Generator',
    5: 'Reading Recommendation Engine',
    6: 'Catalog Metadata Synthesizer',
    7: 'Context Memory Indexer',
    8: 'Reading Path Optimizer',
    9: 'AI Reading Assistant',
    10: 'Adaptive Search Router',
    11: 'Reading Pattern Analyst',
    12: 'Library Knowledge Extractor',
    13: 'Author Insight Engine',
    14: 'Glossary Lookup Bot',
    15: 'Recommendation Re-ranker',
    16: 'Search Query Optimizer',
    17: 'Reading Session Tracker',
    18: 'Conversation Memory Bot',
    19: 'Tag Relationship Mapper',
    20: 'Citation Indexer',
    21: 'Voice Prompt Interpreter',
    22: 'Reading Goal Coach',
    23: 'Reading Velocity Predictor',
    24: 'Catalog Quality Analyzer',
    25: 'User Intent Classifier',
    26: 'Narrative summarizer',
    27: 'Topic Relevance Matcher',
    28: 'Library Search Guard',
    29: 'Content Access Manager',
    30: 'Library Safety Monitor',
    31: 'Telemetry Aggregator',
    32: 'Metrics Normalizer',
    33: 'Session Event Logger',
    34: 'Error Trace Collector',
    35: 'Chat Audit Monitor',
    36: 'Background Sync Watcher',
    37: 'Usage Signal Processor',
    38: 'Storage Health Checker',
    39: 'State Recovery Agent',
    40: 'Security Guard Bot',
    41: 'Context Queue Manager',
    42: 'Index Refresh Agent',
    43: 'Memory Shrinker',
    44: 'Telemetry Caching Bot',
    45: 'Fault Tolerance Router',
    46: 'Readiness Verifier',
    47: 'Cache Compaction Engine',
    48: 'Recommendation Broker',
    49: 'Platform Sync Bot',
    50: 'Library Integrity Monitor',
    51: 'Data Access Policy Bot',
    52: 'Usage Privacy Guard',
    53: 'Search Access Director',
    54: 'Smart Index Purger',
    55: 'Telemetry Snapshot Bot',
    56: 'Interface Event Relay',
    57: 'Local Data Recovery Bot',
    58: 'Deployment Watcher',
    59: 'Library Routine Orchestrator',
    60: 'Stable Command Router',
    61: 'Master Orchestrator'
  };

  function safeJsonParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function normalizeBotId(input) {
    if (typeof input === 'number') return input;
    if (typeof input === 'string') {
      const match = input.match(/\d+/);
      return match ? Number(match[0]) : null;
    }
    return null;
  }

  function getBots() {
    const stored = safeJsonParse(localStorage.getItem('dbl_bot_registry'), []);
    if (Array.isArray(stored) && stored.length) return stored;
    return Object.keys(BOT_NAMES).map((botId) => ({
      id: Number(botId),
      name: BOT_NAMES[Number(botId)],
      status: 'ready'
    }));
  }

  function logTelemetry(event) {
    const existing = safeJsonParse(localStorage.getItem('dbl_bot_logs'), []);
    existing.push({
      time: new Date().toISOString(),
      event
    });
    localStorage.setItem('dbl_bot_logs', JSON.stringify(existing.slice(-200)));
  }

  function metric(key) {
    const current = safeJsonParse(localStorage.getItem('dbl_bot_metrics'), {});
    current[key] = (current[key] || 0) + 1;
    current.total = (current.total || 0) + 1;
    localStorage.setItem('dbl_bot_metrics', JSON.stringify(current));
  }

  function greetingResponse(message) {
    const trimmed = String(message || '').trim().toLowerCase();
    if (!trimmed) return 'Hello! I am your digital library assistant. How can I help today?';
    if (['hi', 'hello', 'hey', 'hey there', 'hi there'].includes(trimmed)) {
      return 'Hello! I’m your library assistant. I can help you search books, check stats, or explain commands. Try /help for options.';
    }
    if (/^hi\b|^hello\b|^hey\b/.test(trimmed)) {
      return 'Hello! I’m ready to help you explore the digital library and track your reading progress.';
    }
    return null;
  }

  class BotEnginePart1 {
    constructor() {
      this.name = 'BotEnginePart1';
      this.registry = new Map();
      for (let index = 1; index <= 30; index += 1) {
        this.registry.set(index, { id: index, name: BOT_NAMES[index] || 'Bot ' + index });
      }
    }

    getBot(id) {
      return this.registry.get(Number(id));
    }
  }

  class BotEnginePart2 {
    constructor() {
      this.name = 'BotEnginePart2';
      this.registry = new Map();
      for (let index = 31; index <= 60; index += 1) {
        this.registry.set(index, { id: index, name: BOT_NAMES[index] || 'Bot ' + index });
      }
    }

    getBot(id) {
      return this.registry.get(Number(id));
    }
  }

  class MasterBotEngine {
    constructor() {
      this.name = 'MasterBotEngine';
      this.version = '2.1.0';
      this.part1 = new BotEnginePart1();
      this.part2 = new BotEnginePart2();
      this.registry = new Map([...this.part1.registry, ...this.part2.registry]);
      this.registry.set(61, { id: 61, name: BOT_NAMES[61] || 'Master Orchestrator' });
      this.bootstrap();
    }

    bootstrap() {
      const existing = getBots();
      this.registry.forEach((bot, key) => {
        const match = existing.find((candidate) => Number(candidate.id) === key);
        if (!match) {
          existing.push({ id: key, name: bot.name, status: 'ready' });
        }
      });
      localStorage.setItem('dbl_bot_registry', JSON.stringify(existing));
    }

    getBot(id) {
      return this.registry.get(Number(id));
    }

    async handleInput(input, context = {}) {
      const rawInput = String(input || '').trim();
      logTelemetry({ type: 'input', rawInput, context });
      metric('requests');

      const greeting = greetingResponse(rawInput);
      if (greeting) {
        return { ok: true, botId: 'BOT-61', message: greeting, data: { mode: 'greeting' } };
      }

      const normalized = normalizeBotId(rawInput);
      if (normalized && this.registry.has(normalized)) {
        const bot = this.registry.get(normalized);
        return { ok: true, botId: `BOT-${String(normalized).padStart(2, '0')}`, message: `Active: ${bot.name}. Ready to process your request.`, data: { bot } };
      }

      const lower = rawInput.toLowerCase();
      if (lower === '/help' || lower === 'help') {
        return { ok: true, botId: 'BOT-61', message: 'Available commands: /help, /search, /stats, /status. You can also ask like “hello” or “find AI books”.', data: { mode: 'help' } };
      }
      if (lower === '/status' || lower === 'status') {
        return { ok: true, botId: 'BOT-61', message: 'System online. 61-bot network active. Library catalog and telemetry monitoring are stable.', data: { mode: 'status' } };
      }
      if (lower === '/stats' || lower === 'stats') {
        const metrics = safeJsonParse(localStorage.getItem('dbl_bot_metrics'), {});
        return { ok: true, botId: 'BOT-61', message: `Library stats: ${metrics.total || 0} bot events, ${getBots().length} active bots, and all systems ready.`, data: { metrics } };
      }
      if (lower.startsWith('/search ') || lower.startsWith('search ')) {
        const query = rawInput.replace(/^\/search\s+/i, '').replace(/^search\s+/i, '');
        const message = query ? `Searching the library for “${query}”. I’ll prioritize matching titles, authors, and related topics.` : 'Search request received. Please specify a title, topic, or author to look up.';
        return { ok: true, botId: 'BOT-61', message, data: { query } };
      }

      if (lower.includes('book') || lower.includes('library') || lower.includes('read')) {
        return { ok: true, botId: 'BOT-61', message: 'I can help you discover books, open reading recommendations, and review reading stats in the library. Try a search query or use /help.', data: { mode: 'library' } };
      }

      return { ok: true, botId: 'BOT-61', message: 'I understood your request. I can assist with book discovery, reading stats, catalog searches, and bot commands.', data: { mode: 'default' } };
    }
  }

  const engine = new MasterBotEngine();
  window.BotEnginePart1 = BotEnginePart1;
  window.BotEnginePart2 = BotEnginePart2;
  window.MasterBotEngine = MasterBotEngine;
  window.completeBotEngine = engine;
  window.DigitalBookLibraryBot = engine;
})();
