// ==UserScript==
// @name         OpenRouter 中文化插件（远程词典试验版）
// @namespace    https://github.com/isdoge/openrouter-chinese/remote-dictionary-preview
// @version      0.2.0-beta.1
// @description  OpenRouter 中文化测试版：词典从 GitHub 加载，支持本地缓存和定期同步
// @author       狗带带子
// @icon         https://ts2.tc.mm.bing.net/th/id/ODF.l3ZEv6Gwma3We2rLiXcGSw?w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2
// @license      MIT
// @homepageURL  https://github.com/isdoge/openrouter-chinese
// @supportURL   https://github.com/isdoge/openrouter-chinese/issues
// @downloadURL  https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/dist/openrouter-chinese-remote.user.js
// @updateURL    https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/dist/openrouter-chinese-remote.user.js
// @match        https://openrouter.ai/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const SCRIPT_NAME = "openrouter-chinese-remote";
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
  // 离线首次安装时的最小保底词典；完整词典由 locales/zh-CN.json 提供。
  let EXACT_TEXT = new Map([
    [
      "Skip to content",
      "跳到内容"
    ],
    [
      "Search",
      "搜索"
    ],
    [
      "Home",
      "首页"
    ],
    [
      "Models",
      "模型"
    ],
    [
      "Settings",
      "设置"
    ],
    [
      "API Keys",
      "API 密钥"
    ],
    [
      "Create",
      "创建"
    ],
    [
      "Save",
      "保存"
    ],
    [
      "Cancel",
      "取消"
    ],
    [
      "Close",
      "关闭"
    ],
    [
      "Delete",
      "删除"
    ],
    [
      "Credits",
      "余额"
    ],
    [
      "Workspaces",
      "工作区"
    ],
    [
      "Logs",
      "日志"
    ],
    [
      "Activity",
      "活动"
    ],
    [
      "Loading...",
      "正在加载..."
    ],
    [
      "Account",
      "账号"
    ],
    [
      "New Key",
      "新建密钥"
    ],
    [
      "Usage",
      "用量"
    ],
    [
      "Chat",
      "聊天"
    ],
    [
      "Fusion",
      "融合"
    ],
    [
      "Rankings",
      "排行榜"
    ]
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
    [/^Image Model Rankings \| OpenRouter$/, "图像模型排行榜 | OpenRouter"],
    [/^Embedding Model Rankings \| OpenRouter$/, "嵌入模型排行榜 | OpenRouter"],
    [/^Rerank Model Rankings \| OpenRouter$/, "重排模型排行榜 | OpenRouter"],
    [/^Video Model Rankings \| OpenRouter$/, "视频模型排行榜 | OpenRouter"],
    [/^Speech Model Rankings \| OpenRouter$/, "语音模型排行榜 | OpenRouter"],
    [/^Transcription Model Rankings \| OpenRouter$/, "转录模型排行榜 | OpenRouter"],
    [/^Classifiers \| OpenRouter$/, "分类器 | OpenRouter"],
    [/^New Classifier \| OpenRouter$/, "新建分类器 | OpenRouter"],
    [/^(.+) \| Settings \| OpenRouter$/, "$1 | 设置 | OpenRouter"],
    [/^Default (.+)$/, "默认 $1"],
    [/^Short (.+)$/, "短格式 $1"],
    [/^ISO (.+)$/, "ISO $1"],
    [/^Relative (.+)$/, "相对时间 $1"],
    [/^Select all keys$/, "选择全部密钥"],
    [/^Select (.+)$/, "选择 $1"],
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
    [/^([\d.,]+[KMGTP]?) tokens$/, "$1 Token"],
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
  ];


  const DICTIONARY_URL = "https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/locales/zh-CN.json";
  const DICTIONARY_CACHE_KEY = "openrouter-zh-remote-dictionary-v1";
  const LAST_SUCCESS_KEY = "openrouter-zh-remote-last-success-v1";
  const LAST_ATTEMPT_KEY = "openrouter-zh-remote-last-attempt-v1";
  const DICTIONARY_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
  const DICTIONARY_RETRY_INTERVAL_MS = 10 * 60 * 1000;
  const DICTIONARY_MAX_BYTES = 800_000;
  let currentDictionaryJson = null;
  let dictionaryRequest = null;
  let originalPageTitle = null;
  let translatedPageTitle = null;

  function parseDictionary(raw) {
    if (typeof raw !== "string" || raw.length > DICTIONARY_MAX_BYTES) {
      return null;
    }
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return null;
      }
      const entries = Object.entries(data);
      if (entries.length < 20 || entries.length > 5000) {
        return null;
      }
      for (const [key, value] of entries) {
        if (!key.trim() || key.length > 1000
            || typeof value !== "string" || !value.trim() || value.length > 5000) {
          return null;
        }
      }
      return { entries, serialized: JSON.stringify(data) };
    } catch {
      return null;
    }
  }

  function loadCachedDictionary() {
    try {
      const saved = parseDictionary(GM_getValue(DICTIONARY_CACHE_KEY, ""));
      if (!saved) {
        return;
      }
      currentDictionaryJson = saved.serialized;
      EXACT_TEXT = new Map([...EXACT_TEXT, ...saved.entries]);
    } catch (error) {
      console.warn("[" + SCRIPT_NAME + "] 无法读取翻译缓存，使用内置词典", error);
    }
  }

  function requestDictionary(force) {
    return new Promise((resolve, reject) => {
      try {
        GM_xmlhttpRequest({
          method: "GET",
          url: DICTIONARY_URL + (force ? "?refresh=" + Date.now() : ""),
          timeout: 12000,
          headers: { Accept: "application/json" },
          onload(response) {
            if (response.status !== 200) {
              reject(new Error("HTTP " + response.status));
              return;
            }
            resolve(response.responseText);
          },
          onerror() {
            reject(new Error("词典请求失败"));
          },
          ontimeout() {
            reject(new Error("词典请求超时"));
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async function refreshDictionary(force = false) {
    if (dictionaryRequest) {
      return dictionaryRequest;
    }

    const now = Date.now();
    if (!force) {
      try {
        const successAt = Number(GM_getValue(LAST_SUCCESS_KEY, 0)) || 0;
        const attemptAt = Number(GM_getValue(LAST_ATTEMPT_KEY, 0)) || 0;
        if (successAt && now - successAt < DICTIONARY_CHECK_INTERVAL_MS) {
          return false;
        }
        if (attemptAt && now - attemptAt < DICTIONARY_RETRY_INTERVAL_MS) {
          return false;
        }
      } catch {
        // 存储不可用时仍允许尝试获取远程词典。
      }
    }

    dictionaryRequest = (async () => {
      try {
        try {
          GM_setValue(LAST_ATTEMPT_KEY, now);
        } catch { /* 存储失败时仍继续当前请求 */ }

        const responseText = await requestDictionary(force);
        const parsed = parseDictionary(responseText);
        if (!parsed) {
          throw new Error("远程词典无效，已保留旧词典");
        }

        const changed = currentDictionaryJson !== parsed.serialized;
        if (changed) {
          // 先完成校验和存储，再一次性替换内存词典。
          try {
            GM_setValue(DICTIONARY_CACHE_KEY, parsed.serialized);
          } catch (error) {
            console.warn("[" + SCRIPT_NAME + "] 新词典已加载，但持久化缓存失败", error);
          }
          EXACT_TEXT = new Map(parsed.entries);
          currentDictionaryJson = parsed.serialized;
          if (started) {
            run();
          }
        }

        try {
          GM_setValue(LAST_SUCCESS_KEY, Date.now());
        } catch { /* 不影响当前已生效的翻译 */ }
        console.info("[" + SCRIPT_NAME + "] 词典同步成功：" + parsed.entries.length + " 条");
        return changed;
      } catch (error) {
        console.warn("[" + SCRIPT_NAME + "] 词典更新失败，继续使用本地词典", error);
        return false;
      } finally {
        dictionaryRequest = null;
      }
    })();
    return dictionaryRequest;
  }

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
    // 授权 GM_* 后处于隔离环境，不能只依赖 history.pushState 包装。
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
    if (!location.hostname.endsWith("openrouter.ai")) {
      return;
    }
    if (!isAllowedPath()) {
      return;
    }
    loadCachedDictionary();
    observeRouteChanges();
    GM_registerMenuCommand("立即更新中文词典（试验版）", () => refreshDictionary(true));
    void refreshDictionary(false);
    window.__openrouterChineseRemote = {
      run,
      translate,
      refreshDictionary,
      version: "0.2.0-beta.1",
    };
    console.info(`[${SCRIPT_NAME}] OpenRouter 中文化插件 bootstrapped`);
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
