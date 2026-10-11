// ==UserScript==
// @name         OpenRouter 中文化插件
// @namespace    https://github.com/isdoge/openrouter-chinese
// @version      1.0.0
// @description  中文化 OpenRouter 界面，内置完整词典，支持缓存与多源在线更新
// @author       狗带带子
// @icon         https://ts2.tc.mm.bing.net/th/id/ODF.l3ZEv6Gwma3We2rLiXcGSw?w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2
// @license      MIT
// @homepageURL  https://github.com/isdoge/openrouter-chinese
// @supportURL   https://github.com/isdoge/openrouter-chinese/issues
// @downloadURL  https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/dist/openrouter-chinese.user.js
// @updateURL    https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/dist/openrouter-chinese.user.js
// @match        https://openrouter.ai/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @connect      cdn.jsdelivr.net
// @noframes
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const SCRIPT_NAME = "openrouter-chinese";
  const INITIAL_RUN_DELAY_MS = 1200;
  const ALLOWED_PATH_PREFIXES = [
    "/workspaces",
    "/settings",
    "/activity",
    "/logs",
    "/labs",
    "/apps",
    "/rankings",
    "/chat",
    "/fusion",
    "/models",
    "/benchmarks",
    "/ori",
    "/spawn",
    "/discover",
    "/compare",
  ];
  const ATTRIBUTES = [
    "aria-label",
    "title",
    "placeholder",
    "data-content",
    "data-placeholder",
  ];
  const SKIP_TAGS = new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "CODE",
    "PRE",
    "TEXTAREA",
  ]);
  // 属性（如 placeholder）不承载用户输入，只需跳过非展示标签；TEXTAREA 的提示文案也应翻译
  const ATTR_SKIP_TAGS = new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
  ]);
  const REGEX_RULES = [
    [/^API Keys \| Settings \| OpenRouter$/, "API 密钥 | 设置 | OpenRouter"],
    [/^API Key \| Settings \| OpenRouter$/, "API 密钥 | 设置 | OpenRouter"],
    [/^BYOK \| Settings \| OpenRouter$/, "BYOK | 设置 | OpenRouter"],
    [/^(.+) BYOK \| Settings \| OpenRouter$/, "$1 BYOK | 设置 | OpenRouter"],
    [/^Routing \| Settings \| OpenRouter$/, "路由 | 设置 | OpenRouter"],
    [/^Presets \| Settings \| OpenRouter$/, "预设 | 设置 | OpenRouter"],
    [/^Plugins \| Settings \| OpenRouter$/, "插件 | 设置 | OpenRouter"],
    [/^Guardrails \| OpenRouter$/, "护栏 | OpenRouter"],
    [/^Workspace Settings \| OpenRouter$/, "工作区设置 | OpenRouter"],
    [/^Privacy Settings \| OpenRouter$/, "隐私设置 | OpenRouter"],
    [/^Credits \| OpenRouter$/, "余额 | OpenRouter"],
    [/^Logs \| OpenRouter$/, "日志 | OpenRouter"],
    [/^Activity \| OpenRouter$/, "活动 | OpenRouter"],
    [/^Rankings \| OpenRouter$/, "排行榜 | OpenRouter"],
    [/^LLM Rankings \| OpenRouter$/, "大语言模型排行榜 | OpenRouter"],
    [/^Decision Model Rankings \| OpenRouter$/, "决策模型排行榜 | OpenRouter"],
    [/^Batch Rankings \| OpenRouter$/, "批量排行榜 | OpenRouter"],
    [/^App & Agent Rankings \| OpenRouter$/, "应用与 Agent 排行榜 | OpenRouter"],
    [/^Ori - Use Every Model, Right Where You Are \| OpenRouter$/, "Ori - 使用每一个模型，就在你身边 | OpenRouter"],
    [/^Image Model Rankings \| OpenRouter$/, "图像模型排行榜 | OpenRouter"],
    [/^Embedding Model Rankings \| OpenRouter$/, "嵌入模型排行榜 | OpenRouter"],
    [/^Rerank Model Rankings \| OpenRouter$/, "重排模型排行榜 | OpenRouter"],
    [/^Video Model Rankings \| OpenRouter$/, "视频模型排行榜 | OpenRouter"],
    [/^Speech Model Rankings \| OpenRouter$/, "语音模型排行榜 | OpenRouter"],
    [/^Transcription Model Rankings \| OpenRouter$/, "转录模型排行榜 | OpenRouter"],
    [/^I\/O Logging Settings \| Observability \| OpenRouter$/, "I/O 日志设置 | 可观测性 | OpenRouter"],
    [/^(\d+)\s+routers$/, "$1 个路由器"],
    // 应用详情页：榜单标题中的应用名是动态的，保留原文。
    [/^Top models used by (.+) this month$/, "$1 本月用量最高的模型"],
    // 站点自身 i18n 会把句中的 Docs 率先翻成"文档"，导致整节点文本对不上词典键，这里用正则兜底。
    [/^Learn more about session tracking in our (?:(.+))?$/, (match, tail) => "关于会话追踪的更多说明见我们的" + (tail ? " " + tail : "")],
    [/^Classifiers \| OpenRouter$/, "分类器 | OpenRouter"],
    [/^New Classifier \| OpenRouter$/, "新建分类器 | OpenRouter"],
    [/^(.+) \| Settings \| OpenRouter$/, "$1 | 设置 | OpenRouter"],
    [/^Security \| OpenRouter$/, "安全 | OpenRouter"],
    [/^Default (.+)$/, "默认 $1"],
    [/^Short (.+)$/, "短格式 $1"],
    [/^ISO (.+)$/, "ISO $1"],
    [/^Relative (.+)$/, "相对时间 $1"],
    [/^Select all keys$/, "选择全部密钥"],
    [/^Select (.+)$/, "选择 $1"],
    [/^Tools: (\d+) active$/, "工具：$1 个已启用"],
    [/^Show (\d+) more$/, "显示另外 $1 个"],
    [/^Key limit: (\d+)% used of unlimited$/, "密钥限额：已使用 $1%，上限不限"],
    [/^Set a spend limit on (\d+) keys?$/, "为 $1 个密钥设置消费限额"],
    [/^Review (\d+) keys? without expiration$/, "复查 $1 个无过期时间的密钥"],
    [/^Actions for (.+)$/, "$1 的操作"],
    [/^Remove (\d+) unused keys?$/, "移除 $1 个闲置密钥"],
    [/^Unused (\d+)\+ days$/, "$1 天以上未使用"],
    [/^(\d+) of (\d+) keys?$/, "第 $1 个，共 $2 个密钥"],
    [/^of (\d+) keys?$/, "共 $1 个密钥"],
    [/^(\d+)\s+key$/, "$1 个密钥"],
    [/^(\d+)\s+keys$/, "$1 个密钥"],
    [/^(\d+)\s+guardrail$/, "$1 个护栏"],
    [/^(\d+)\s+guardrails$/, "$1 个护栏"],
    [/^(\d+)\s+result$/, "$1 个结果"],
    [/^(\d+)\s+results$/, "$1 个结果"],
    [/^(\d+)\s+model$/, "$1 个模型"],
    [/^(\d+)\s+models$/, "$1 个模型"],
    [/^(\d+)\s+models matched$/, "匹配 $1 个模型"],
    [/^(\d+)\s+allowed$/, "允许 $1 个"],
    [/^(.+)\s+context$/, "$1 上下文"],
    [/^\$(.+)\s+\/M input tokens$/, "$$$1 / 百万输入 Token"],
    [/^\$(.+)\s+\/M output tokens$/, "$$$1 / 百万输出 Token"],
    [/^\$(.+)\s+\/M input Token$/, "$$$1 / 百万输入 Token"],
    [/^\$(.+)\s+\/M output Token$/, "$$$1 / 百万输出 Token"],
    [/^from \$(.+) per second$/, "每秒 $$$1 起"],
    [/^from \$(.+) per image$/, "每张图 $$$1 起"],
    [/^\$(.+) per minute$/, "每分钟 $$$1"],
    [/^\$(.+) per image$/, "每张图 $$$1"],
    [/^\$(.+) per 1M characters$/, "每 100 万字符 $$$1"],
    [/^(\d+)\s+available \| (\d+)\s+unavailable$/, "$1 个可用 | $2 个不可用"],
    [/^Remaining credits: (.+)$/, "剩余额度：$1"],
    [/^Personal Account: (.+)$/, "个人账号：$1"],
    [/^\$(.+) credits used$/, "$$$1 积分已使用"],
    [/^(.+) credits used$/, "$1 积分已使用"],
    [/^(\d+)% used of unlimited$/, "已使用 $1%，上限不限"],
    [/^(\d+)% used of (.+)$/, "已使用 $1%，上限 $2"],
    [/^Delete (.+)$/, "删除 $1"],
    [/^Remove (.+)$/, "移除 $1"],
    [/^Edit (.+)$/, "编辑 $1"],
    [/^Copy (.+)$/, "复制 $1"],
    [/^Create (.+)$/, "创建 $1"],
    [/^Add (.+)$/, "添加 $1"],
    [/^No (.+) found$/, "未找到 $1"],
    [/^Search by (.+)\.\.\.$/, "按$1搜索..."],
    [/^Benchmarks \| OpenRouter$/, "基准测试 | OpenRouter"],
    [/^Usage data through (.+)$/, "用量数据截至 $1"],
    [/^([\d.,]+[KMGTP]?)\s+[Tt]okens?$/, "$1 Token"],
    // "$1.46B tokens" 用大写 B（十亿），原有的 KMGTP 集合漏了它
    [/^([\d.,]+[KMGTPBT]?)\s+tokens?$/, "$1 Token"],
    [/^([\d.,]+[KMGTPBT]?)\s+characters$/, "$1 个字符"],
    [/^(\d+)% off$/, "减 $1%"],
    [/^(\d+)mo ago$/, "$1 个月前"],
    [/^(\d+)w ago$/, "$1 周前"],
    [/^(\d+)d ago$/, "$1 天前"],
    [/^(\d+)h ago$/, "$1 小时前"],
    [/^(\d+)y ago$/, "$1 年前"],
    [/^(\d+)mo$/, "$1 个月"],
    [/^([\d.,]+) t\/s$/, "$1 Token/秒"],
    [/^([\d.,]+)ms$/, "$1 毫秒"],
    [/^(\d+) benchmarks$/, "$1 个基准测试"],
    [/^last run (.+)$/, "上次运行 $1"],
    [/^([\d.]+)s$/, "$1 秒"],
    [/^([\d.]+)m$/, "$1 分钟"],
    [/^([\d.]+)h$/, "$1 小时"],
    [/^Medium \((.+)\)$/, "中（$1）"],
    [/^High \((.+)\)$/, "高（$1）"],
    [/^Below \$(.+?) · Email → (.+)$/, "低于 $$$1 · 邮件 → $2"],
    [/^(\d+) items$/, "$1 项"],
    [/^(\d+) transactions$/, "$1 笔交易"],
    [/^(.+) docs$/, "$1 文档"],
    [/^Toggle (.+)$/, "切换 $1"],
    [/^Total available credits: \$(.+)$/, "总可用余额：$$$1"],
    [/^([\d.,]+[KMBT]?)\s+subrequests$/, "$1 次子请求"],
    [/^(.+):\s+([\d,]+)\s+subrequests this week$/, "$1：本周 $2 个子请求"],
    [/^Domain · ([\d.]+)% of all spend$/, "领域 · 占总支出 $1%"],
    [/^([\d.]+)% of all spend$/, "占总支出 $1%"],
    // 分类名（语言 / 领域）自身也要过一遍词典，否则会留下 "占 Hebrew 支出的 58.0%" 这类半截译文。
    [/^([\d.]+)% of (.+?) spend$/, (match, pct, category) => `占${translate(category)}支出的 ${pct}%`],
    // 变化幅度标题（含具体数字）
    [/^([\d.,]+%) — Change in (.+) in the last week from the previous period$/, (match, pct, metric) => `${pct} — 本周${translate(metric)}数相对上一周期的变化`],
    [/^([\d.,]+[KMBT]?)\s+requests$/, "$1 次请求"],
    [/^(\$[\d.,]+)\/M$/, "$1/百万"],
    [/^Find a model to pin, (\d+) of (\d+) pinned$/, "查找要固定的模型，已固定 $1 个，共 $2 个"],
    [/^(.+) · via OpenRouter$/, "$1 · 通过 OpenRouter"],
    [/^([\d.,]+)\s+tok\/s$/, "$1 Token/秒"],
    // Apps 页：榜单名次（分类名同样要过词典）
    [/^Ranked at #(\d+) in (.+) category$/, (match, rank, cat) => `在${translate(cat)}分类中排名第 ${rank}`],
    // 转录页：字符数计价
    [/^(\$[\d.,]+)\/M characters$/, "$1/百万字符"],
  ];


  const SCRIPT_VERSION = /* build:version */ "1.0.0";
  const ONLINE_MODE = /* build:online */ true;
  const DICTIONARY_REVISION = /* build:revision */ 2026101001;
  // 本地版构建时注入完整快照；在线版为空对象，词典全部来自外置 JSON。
  const BUILTIN_DICTIONARY = /* build:dictionary */ {};
  let EXACT_TEXT = new Map(Object.entries(BUILTIN_DICTIONARY));
  let currentRevision = DICTIONARY_REVISION;
  let dictionarySource = ONLINE_MODE ? "remote" : "builtin";
  let originalPageTitle = null;
  let translatedPageTitle = null;

  function getDictionaryStatus() {
    return {
      version: SCRIPT_VERSION,
      revision: currentRevision,
      source: dictionarySource,
      entries: EXACT_TEXT.size,
    };
  }

  // build:online:start
  const DICTIONARY_SOURCES = [
    "https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/locales/zh-CN.online.json",
    "https://cdn.jsdelivr.net/gh/isdoge/openrouter-chinese@main/locales/zh-CN.online.json",
    "https://raw.githubusercontent.com/isdoge/openrouter-chinese/v1.0.0/locales/zh-CN.online.json",
  ];
  const DICTIONARY_CACHE_KEY = "openrouter-zh-remote-dictionary-v1";
  const DICTIONARY_MAX_BYTES = 800_000;
  // 本地版锚定内置快照签名；在线版初始为 null，首次成功加载后锚定该词典签名。
  let currentSignature = Object.keys(BUILTIN_DICTIONARY).length > 0
    ? dictionarySignature(Object.entries(BUILTIN_DICTIONARY))
    : null;
  let dictionaryRequest = null;

  function dictionarySignature(entries) {
    return JSON.stringify(entries.slice().sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  }

  function parseDictionary(raw, allowLegacy = false) {
    if (typeof raw !== "string" || raw.length > DICTIONARY_MAX_BYTES) return null;
    try {
      const bytes = typeof TextEncoder !== "undefined"
        ? new TextEncoder().encode(raw).length
        : encodeURIComponent(raw).replace(/%[\dA-F]{2}/g, "x").length;
      if (bytes > DICTIONARY_MAX_BYTES) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object" || Array.isArray(data)) return null;
      const versioned = Object.hasOwn(data, "schemaVersion")
        || Object.hasOwn(data, "revision") || Object.hasOwn(data, "dictionary");
      if (!versioned && !allowLegacy) return null;
      if (versioned && (data.schemaVersion !== 1
          || !Number.isSafeInteger(data.revision) || data.revision < 1
          || !Number.isSafeInteger(data.entries))) return null;
      const dictionary = versioned ? data.dictionary : data;
      if (!dictionary || typeof dictionary !== "object" || Array.isArray(dictionary)) return null;
      const entries = Object.entries(dictionary);
      if (entries.length < 20 || entries.length > 5000) return null;
      if (versioned && data.entries !== entries.length) return null;
      for (const [key, value] of entries) {
        if (!key.trim() || key.length > 4000
            || typeof value !== "string" || !value.trim() || value.length > 8000
            || ["__proto__", "prototype", "constructor"].includes(key)) return null;
      }
      const revision = versioned ? data.revision : 0;
      return {
        revision, entries, legacy: !versioned,
        signature: dictionarySignature(entries),
        serialized: JSON.stringify({ schemaVersion: 1, revision, entries: entries.length, dictionary }),
      };
    } catch {
      return null;
    }
  }

  function canApplyDictionary(parsed) {
    if (!parsed || parsed.legacy || parsed.revision < currentRevision) return false;
    if (parsed.revision !== currentRevision) return true;
    // 同版本签名比对：本地版以内置快照为锚；在线版以当前已加载的词典为锚，
    // 尚无任何词典（currentSignature 为空）时远端本身就是版本依据。
    return currentSignature === null || parsed.signature === currentSignature;
  }

  function applyDictionary(parsed, source) {
    // 更新只作为覆盖层；远端缺少某个键不能删除内置翻译。
    EXACT_TEXT = new Map([...Object.entries(BUILTIN_DICTIONARY), ...parsed.entries]);
    currentRevision = parsed.revision;
    currentSignature = parsed.signature;
    dictionarySource = source;
    if (started) run();
  }

  function readStored(key, fallback) {
    try { return GM_getValue(key, fallback); } catch { return fallback; }
  }

  function loadCachedDictionary() {
    const saved = parseDictionary(readStored(DICTIONARY_CACHE_KEY, ""), true);
    if (!saved) return;
    if (saved.legacy) {
      // 旧缓存没有版本证据，只接纳额外键，不覆盖较新的内置快照。
      for (const [key, value] of saved.entries) {
        if (!EXACT_TEXT.has(key)) EXACT_TEXT.set(key, value);
      }
      dictionarySource = "legacy-cache";
    } else if (canApplyDictionary(saved)) {
      applyDictionary(saved, "cache");
    }
  }

  function requestSource(baseUrl, force) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: baseUrl + (force ? "?refresh=" + Date.now() : ""),
        timeout: 8000,
        anonymous: true,
        headers: { Accept: "application/json" },
        onload(response) {
          if (response.status !== 200) {
            reject(new Error("HTTP " + response.status));
            return;
          }
          resolve(response.responseText);
        },
        onerror() { reject(new Error("词典请求失败")); },
        ontimeout() { reject(new Error("词典请求超时")); },
        onabort() { reject(new Error("词典请求已取消")); },
      });
    });
  }

  function syncSharedDictionary(strict = false) {
    // 提交校验不可把存储读取异常当成空缓存；启动检查仍可容错。
    const raw = strict ? GM_getValue(DICTIONARY_CACHE_KEY, "") : readStored(DICTIONARY_CACHE_KEY, "");
    const shared = parseDictionary(raw);
    if (!shared || shared.legacy || shared.revision < currentRevision) return;
    if (shared.revision === currentRevision) {
      if (shared.signature !== currentSignature && strict) {
        const error = new Error("同版本词典内容冲突");
        error.code = "DICTIONARY_VERSION_CONFLICT";
        throw error;
      }
      return;
    }
    if (canApplyDictionary(shared)) {
      applyDictionary(shared, "cache");
    }
  }

  async function requestDictionary(force) {
    for (const url of DICTIONARY_SOURCES) {
      let parsed;
      try {
        parsed = parseDictionary(await requestSource(url, force));
      } catch { continue; }
      if (!canApplyDictionary(parsed)) continue;
      try {
        await persistDictionary(parsed, "remote");
        return parsed;
      } catch (error) {
        // 提交时其他页抢先保存了更新词典，也要继续尝试后续来源。
        if (error.code === "DICTIONARY_VERSION_CONFLICT") continue;
        throw error;
      }
    }
    throw new Error("全部词典来源不可用或版本无效");
  }

  async function persistDictionary(parsed, source) {
    if (typeof navigator === "undefined" || !navigator.locks?.request) {
      throw new Error("浏览器不支持安全的跨标签页词典更新");
    }
    // 原生 Web Locks 覆盖整个读－校验－写区间，页内 Promise 不足以保护共享 GM 缓存。
    return navigator.locks.request("openrouter-zh-dictionary-commit-v1", { mode: "exclusive" }, async () => {
      syncSharedDictionary(true);
      if (!canApplyDictionary(parsed)) {
        const error = new Error("词典版本冲突");
        error.code = "DICTIONARY_VERSION_CONFLICT";
        throw error;
      }
      await GM_setValue(DICTIONARY_CACHE_KEY, parsed.serialized);
      applyDictionary(parsed, source);
    });
  }

  async function refreshDictionary() {
    if (dictionaryRequest) return dictionaryRequest;
    syncSharedDictionary();
    dictionaryRequest = (async () => {
      try {
        await requestDictionary(false);
        console.info("[" + SCRIPT_NAME + "] 词典同步成功：" + EXACT_TEXT.size + " 条");
        return true;
      } catch {
        console.warn("[" + SCRIPT_NAME + "] 词典更新失败，继续使用当前词典");
        return false;
      }
    })();
    try { return await dictionaryRequest; } finally { dictionaryRequest = null; }
  }

  function setupDictionaryUpdates() {
    const register = (name, callback) => {
      try { GM_registerMenuCommand(name, callback); } catch { /* 菜单不可用不影响翻译 */ }
    };
    register("立即更新中文词典", async () => {
      const ok = await refreshDictionary();
      window.alert(ok ? "中文词典已更新。" : "未能更新，已保留当前词典。请稍后重试。");
      return ok;
    });
    register("查看词典状态", () => {
      const status = getDictionaryStatus();
      const sources = { builtin: "内置快照", cache: "本地缓存", "legacy-cache": "内置快照＋旧缓存额外条目", remote: "在线更新" };
      window.alert("脚本版本：" + status.version + "\n词典版本：" + status.revision
        + "\n来源：" + sources[status.source] + "\n有效条目：" + status.entries);
    });
  }
  // build:online:end

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  let observer = null;
  let scheduled = false;
  let started = false;

  function isAllowedPath() {
    const pathname = typeof location.pathname === "string" ? location.pathname : "";
    if (pathname === "/") {
      return true;
    }
    return ALLOWED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  }

  function translate(source) {
    if (!source || !source.trim()) {
      return source;
    }

    // 少数界面片段的词典键自带空格，先匹配原串，避免 trim 后永远漏翻。
    const verbatim = EXACT_TEXT.get(source);
    if (verbatim) return verbatim;
    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    const trimmed = source.trim();
    const exact = EXACT_TEXT.get(trimmed);
    if (exact) {
      return `${leading}${exact}${trailing}`;
    }

    if (isSensitive(source)) {
      return source;
    }

    for (const [pattern, replacement] of REGEX_RULES) {
      if (pattern.test(trimmed)) {
        return `${leading}${trimmed.replace(pattern, replacement)}${trailing}`;
      }
    }

    return source;
  }

  function isSensitive(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return true;
    }
    if (/^sk-or-v1-/i.test(trimmed)) {
      return true;
    }
    if (/^[A-Za-z0-9_-]+\/[A-Za-z0-9_.:-]+$/.test(trimmed)) {
      return true;
    }
    if (/^https?:\/\//i.test(trimmed)) {
      return true;
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return true;
    }
    if (/^[a-z0-9_-]{16,}$/i.test(trimmed)) {
      return true;
    }
    return false;
  }

  // 纯 ASCII 英文（不含 CJK）。词典可能把英文规范化成另一个英文（如历史上的 "tokens" -> "Token"），
  // 节点会因此冻死在规范化后的英文上，后续新增的译项再也无法生效，需要按当前文本重新派生源文本。
  function isPlainEnglish(value) {
    return /^[\x00-\x7F]+$/.test(value);
  }

  function getOriginalText(node) {
    const current = node.textContent || "";
    const state = originalText.get(node);
    if (!state) {
      const translated = translate(current);
      const nextState = {
        source: current,
        translated,
      };
      originalText.set(node, nextState);
      return nextState.source;
    }

    if (current !== state.translated) {
      state.source = current;
      state.translated = translate(current);
    } else if (isPlainEnglish(current) && translate(current) !== current) {
      // 当前文本是英文且本身可译：说明它停留在某个规范化（英文值）译项上，按当前文本重新派生。
      state.source = current;
      state.translated = translate(current);
    }
    return state.source;
  }

  function getOriginalAttr(element, attr) {
    let attrs = originalAttrs.get(element);
    if (!attrs) {
      attrs = new Map();
      originalAttrs.set(element, attrs);
    }
    const current = element.getAttribute(attr);
    const state = attrs.get(attr);
    if (!state) {
      const translated = translate(current || "");
      const nextState = {
        source: current,
        translated,
      };
      attrs.set(attr, nextState);
      return nextState.source;
    }

    if (current !== state.translated) {
      state.source = current;
      state.translated = translate(current || "");
    } else if (current && isPlainEnglish(current) && translate(current) !== current) {
      // 与 getOriginalText 同一规则：英文值规范化译项不应把节点冻死在英文上。
      state.source = current;
      state.translated = translate(current);
    }
    return state.source;
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) {
      return true;
    }
    if (SKIP_TAGS.has(parent.tagName)) {
      return true;
    }
    if (parent.isContentEditable || parent.closest('[contenteditable]:not([contenteditable="false"])')) {
      return true;
    }
    if (parent.closest("[data-openrouter-zh-ignore]")) {
      return true;
    }
    if (parent.closest("code, pre, textarea")) {
      return true;
    }
    return false;
  }

  function translateTextNodes(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return shouldSkipTextNode(node)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    let changed = 0;
    let node = walker.nextNode();
    while (node) {
      const source = getOriginalText(node);
      const next = translate(source);
      const state = originalText.get(node);
      if (state) {
        state.translated = next;
      }
      if (next !== node.textContent) {
        node.textContent = next;
        changed += 1;
      }
      node = walker.nextNode();
    }
    return changed;
  }

  function translateSplitTextElements(root) {
    const elements = root.querySelectorAll
      ? root.querySelectorAll("h1,h2,h3,h4,h5,h6,button,[role='button'],span,label,a,p")
      : [];
    let changed = 0;
    for (const element of elements) {
      if (SKIP_TAGS.has(element.tagName)) {
        continue;
      }
      if (element.isContentEditable || element.closest('[contenteditable]:not([contenteditable="false"])')) {
        continue;
      }
      if (element.closest("[data-openrouter-zh-ignore], code, pre, textarea")) {
        continue;
      }
      if (element.children.length > 0 || element.childNodes.length < 2) {
        continue;
      }
      const source = element.textContent || "";
      const next = translate(source);
      if (next !== source) {
        element.textContent = next;
        // textContent 会创建新节点，保留英文原文以便热更新。
        if (element.firstChild) {
          originalText.set(element.firstChild, { source, translated: next });
        }
        changed += 1;
      }
    }
    return changed;
  }

  function translateAttributes(root) {
    let changed = 0;
    const elements = root.querySelectorAll ? root.querySelectorAll("*") : [];
    for (const element of elements) {
      if (ATTR_SKIP_TAGS.has(element.tagName)) {
        continue;
      }
      for (const attr of ATTRIBUTES) {
        if (!element.hasAttribute(attr)) {
          continue;
        }
        const source = getOriginalAttr(element, attr);
        const next = translate(source || "");
        const state = originalAttrs.get(element)?.get(attr);
        if (state) {
          state.translated = next;
        }
        if (next && next !== element.getAttribute(attr)) {
          element.setAttribute(attr, next);
          changed += 1;
        }
      }
    }
    return changed;
  }

  function run() {
    if (!document.body) {
      return 0;
    }
    if (!isAllowedPath()) {
      return 0;
    }
    observer?.disconnect();
    try {
      if (typeof document.title === "string") {
        if (document.title !== translatedPageTitle) {
          originalPageTitle = document.title;
        }
        const nextTitle = translate(originalPageTitle || document.title);
        if (nextTitle !== document.title) {
          document.title = nextTitle;
        }
        translatedPageTitle = nextTitle;
      }
      const changed = translateSplitTextElements(document.body)
        + translateTextNodes(document.body)
        + translateAttributes(document.body);
      document.documentElement.lang = "zh-CN";
      return changed;
    } finally {
      observer?.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTRIBUTES,
      });
    }
  }

  function schedule() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      run();
      setTimeout(run, 150);
      setTimeout(run, 500);
    });
    // 后台标签页的 requestAnimationFrame 永远不会触发，用 setTimeout 兜底重翻译
    setTimeout(() => {
      if (scheduled) {
        scheduled = false;
        run();
        setTimeout(run, 150);
        setTimeout(run, 500);
      }
    }, 350);
  }

  function observeRouteChanges() {
    const notify = () => {
      setTimeout(run, 50);
      setTimeout(run, 250);
      setTimeout(run, 750);
    };

    const wrap = (name) => {
      const original = history[name];
      history[name] = function (...args) {
        const result = original.apply(this, args);
        notify();
        return result;
      };
    };

    wrap("pushState");
    wrap("replaceState");
    window.addEventListener("popstate", notify);
    // 隔离环境不能只依赖 history.pushState 包装，轮询路由兜底。
    let previousRoute = location.pathname + location.search;
    setInterval(() => {
      const route = location.pathname + location.search;
      if (route !== previousRoute) {
        previousRoute = route;
        notify();
      }
    }, 1000);
  }

  function startTranslation() {
    if (started) {
      return;
    }
    started = true;
    observer = new MutationObserver(schedule);
    run();
    setTimeout(run, 300);
    setTimeout(run, 1000);
  }

  function bootstrap() {
    if (location.hostname !== "openrouter.ai") return;
    if (!isAllowedPath()) return;
    loadCachedDictionary();
    observeRouteChanges();
    const api = {
      run, translate, refreshDictionary, getDictionaryStatus, version: SCRIPT_VERSION,
    };
    window.__openrouterChinese = api;
    window.__openrouterChineseRemote = api;
    if (ONLINE_MODE) void refreshDictionary();
    setupDictionaryUpdates();
    console.info("[" + SCRIPT_NAME + "] OpenRouter 中文化插件已启动");
    const delayStart = () => setTimeout(startTranslation, INITIAL_RUN_DELAY_MS);
    if (document.readyState === "complete") {
      delayStart();
    } else {
      window.addEventListener("load", delayStart, { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
