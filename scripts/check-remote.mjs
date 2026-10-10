import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/openrouter-chinese-remote.user.js", import.meta.url), "utf8");
const dist = readFileSync(new URL("../dist/openrouter-chinese-remote.user.js", import.meta.url), "utf8");
const old = readFileSync(new URL("../src/openrouter-chinese.user.js", import.meta.url), "utf8");
const dictionaryText = readFileSync(new URL("../locales/zh-CN.json", import.meta.url), "utf8");
const dict = JSON.parse(dictionaryText);

assert.equal(source, dist, "dist and src must match");
assert.match(source, /@name\s+OpenRouter 中文化插件（远程词典试验版）/);
assert.match(source, /@grant\s+GM_xmlhttpRequest/);
assert.match(source, /@connect\s+raw\.githubusercontent\.com/);
assert.equal(Object.keys(dict).length, 1391, "dictionary should carry migrated entries plus acceptance additions");

const match = old.match(/^  const EXACT_TEXT = new Map\(\[\r?\n([\s\S]*?)^  \]\);/m);
assert.ok(match, "original dictionary exists");
const recordRx = /^\s*\[("(?:[^"\\]|\\.)*"),\s*("(?:[^"\\]|\\.)*")\],?\s*$/;
const expected = new Map();
for (const line of match[1].split("\n").filter((line) => line.trim())) {
  const record = line.match(recordRx);
  assert.ok(record, "unrecognized original record: " + line);
  expected.set(JSON.parse(record[1]), JSON.parse(record[2]));
}
// 远程词典是原版词典的超集：迁移条目逐一保持原值，仅允许验收中记录在案的修正。
// "tokens" 原值为英文 "Token"（规范化条目），会把节点冻死在英文上，故改为 "令牌"。
const DOCUMENTED_OVERRIDES = new Map([["tokens", "令牌"]]);
for (const [key, value] of expected) {
  if (DOCUMENTED_OVERRIDES.has(key)) {
    assert.equal(dict[key], DOCUMENTED_OVERRIDES.get(key), `documented override changed: ${key}`);
    continue;
  }
  assert.equal(dict[key], value, `original translation must be preserved: ${key}`);
}
assert.ok(Object.keys(dict).length > expected.size, "remote dictionary should keep growing beyond the migrated set");

function harness({ store = new Map(), firstReply = dictionaryText, initialText = "One API for Any Model", simulateMain404 = false } = {}) {
  const node = {
    textContent: initialText,
    parentElement: { tagName: "SPAN", closest() { return null; } },
  };
  const doc = {
    readyState: "complete",
    title: "API Keys | Settings | OpenRouter",
    body: { querySelectorAll() { return []; } },
    documentElement: { lang: "en" },
    addEventListener() {},
    createTreeWalker() {
      let visited = false;
      return {
        nextNode() {
          if (visited) return null;
          visited = true;
          return node;
        },
      };
    },
  };
  let reply = firstReply;
  let requestCount = 0;
  let status = 200;
  const timeouts = [];
  const intervals = [];
  let menu = null;
  const context = {
    document: doc,
    window: { addEventListener() {} },
    history: { pushState() {}, replaceState() {} },
    location: { hostname: "openrouter.ai", pathname: "/settings", search: "" },
    NodeFilter: { SHOW_TEXT: 4, FILTER_REJECT: 2, FILTER_ACCEPT: 1 },
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    GM_getValue(key, defaultValue) { return store.has(key) ? store.get(key) : defaultValue; },
    GM_setValue(key, value) { store.set(key, value); },
    GM_registerMenuCommand(_title, callback) { menu = callback; },
    GM_xmlhttpRequest(options) {
      requestCount++;
      const replyStatus = simulateMain404 && options.url.includes("/main/locales/") ? 404 : status;
      options.onload({ status: replyStatus, responseText: reply });
    },
    requestAnimationFrame(fn) { timeouts.push(fn); },
    setTimeout(fn) { timeouts.push(fn); return timeouts.length; },
    setInterval(fn) { intervals.push(fn); return intervals.length; },
    console: { info() {}, warn() {} },
  };
  vm.runInNewContext(source, context, { filename: "openrouter-chinese-remote.user.js", timeout: 3000 });
  assert.ok(context.window.__openrouterChineseRemote, "new script should bootstrap");
  assert.equal(typeof menu, "function", "manual update should be registered");
  return {
    node, doc, store, context, intervals,
    get requests() { return requestCount; },
    get menu() { return menu; },
    setReply(v, code = 200) { reply = v; status = code; },
    start() {
      assert.ok(timeouts.length, "startup timer is scheduled");
      timeouts.shift()();
    },
  };
}

async function flush() {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

const h = harness();
h.start();
assert.equal(h.node.textContent, "One API for Any Model", "no cache: initial fallback must not pretend full translation");
assert.equal(h.doc.documentElement.lang, "zh-CN");
assert.equal(h.doc.title, "API 密钥 | 设置 | OpenRouter");
await flush();
assert.equal(h.node.textContent, dict["One API for Any Model"], "remote dictionary applied to existing DOM node");
assert.equal(h.requests, 1);
assert.ok(h.store.has("openrouter-zh-remote-dictionary-v1"));

const changed = { ...dict, "One API for Any Model": "远程热更新已生效",
  "API Keys | Settings | OpenRouter": "标题热更新已生效" };
h.setReply(JSON.stringify(changed));
await h.context.window.__openrouterChineseRemote.refreshDictionary(true);
assert.equal(h.node.textContent, "远程热更新已生效", "must retranslate using source English text");
assert.equal(h.doc.title, "标题热更新已生效", "title must also retranslate using English source");
assert.equal(h.requests, 2);

h.setReply("{invalid-json");
await h.context.window.__openrouterChineseRemote.refreshDictionary(true);
assert.equal(h.node.textContent, "远程热更新已生效", "malformed response must retain valid dictionary");
assert.equal(h.requests, 3);
h.setReply(dictionaryText, 503);
await h.context.window.__openrouterChineseRemote.refreshDictionary(true);
assert.equal(h.node.textContent, "远程热更新已生效", "failed request must retain last dictionary");

const second = harness({ store: h.store, firstReply: "{invalid-json" });
second.start();
assert.equal(second.node.textContent, dict["One API for Any Model"] === changed["One API for Any Model"]
  ? dict["One API for Any Model"] : changed["One API for Any Model"], "cached dictionary must translate without network");
await flush();
assert.equal(second.requests, 0, "recent cache should prevent duplicate requests");
assert.equal(second.context.window.__openrouterChineseRemote.translate("sk-or-v1-example"), "sk-or-v1-example");

const firstInstallOffline = harness({ firstReply: "network error" });
firstInstallOffline.start();
assert.equal(firstInstallOffline.context.window.__openrouterChineseRemote.translate("API Keys"), "API 密钥");
await flush();
assert.equal(firstInstallOffline.context.window.__openrouterChineseRemote.translate("One API for Any Model"), "One API for Any Model");

const previewBranch = harness({ simulateMain404: true });
previewBranch.start();
await flush();
assert.equal(previewBranch.requests, 2, "before merge, main 404 should retry the preview branch");
assert.equal(previewBranch.node.textContent, dict["One API for Any Model"],
  "preview branch fallback must load the full dictionary");

for (const cached of [undefined, "{broken", "{}"] ) {
  const store = new Map([["openrouter-zh-remote-last-success-v1", Date.now()]]);
  if (cached !== undefined) store.set("openrouter-zh-remote-dictionary-v1", cached);
  const recovering = harness({ store });
  recovering.start();
  await flush();
  assert.equal(recovering.requests, 1, "missing/invalid cache must not wait 24 hours after recent success");
  assert.equal(recovering.node.textContent, dict["One API for Any Model"]);
}

// --- 真实浏览器验收补充：英文值规范化条目曾把节点冻死（Rankings 页 "Token" 漏翻）---
// 词典含 "tokens" -> "Token"（英文值）与 "Token" -> "令牌" 时，节点被规范化成 "Token" 后
// 旧实现会一直从陈旧源文本 "tokens" 推导，永远得不到 "令牌"。
{
  const normalizingDictionary = JSON.stringify({
    ...dict,
    "tokens": "Token",
    "Token": "令牌",
  });
  const frozen = harness({ firstReply: normalizingDictionary, initialText: "tokens" });
  frozen.start();
  await flush();
  assert.equal(frozen.node.textContent, "Token", "normalizing entry should apply once");
  // 站点随后把文本渲染为 "Token"（自身规范化或 i18n 结果）
  frozen.node.textContent = "Token";
  frozen.context.window.__openrouterChineseRemote.run();
  assert.equal(frozen.node.textContent, "令牌",
    "node frozen at an English normalization value must be re-derived from the current text");
  // 再次运行必须保持稳定，不得在 "Token" 与 "令牌" 之间反复横跳
  frozen.context.window.__openrouterChineseRemote.run();
  assert.equal(frozen.node.textContent, "令牌", "re-translation must be stable");
}

// --- 验收新增的动态正则规则 ---
{
  const ready = harness();
  ready.start();
  await flush();
  const { translate } = ready.context.window.__openrouterChineseRemote;
  assert.equal(translate("Tools: 8 active"), "工具：8 个已启用");
  assert.equal(translate("Show 63 more"), "显示另外 63 个");
  assert.equal(translate("Key limit: 0% used of unlimited"), "密钥限额：已使用 0%，上限不限");
  assert.equal(translate("37.6T Token"), "37.6T 令牌");
  assert.equal(translate("37.6T tokens"), "37.6T 令牌");
  assert.equal(translate("sk-or-v1-abc"), "sk-or-v1-abc", "API keys must stay untouched");
  assert.equal(translate("openai/gpt-5"), "openai/gpt-5", "model ids must stay untouched");
}

// --- 验收新增的词典条目 ---
{
  const ready = harness();
  ready.start();
  await flush();
  const { translate } = ready.context.window.__openrouterChineseRemote;
  for (const [key, value] of [
    ["Dashboard", "控制台"],
    ["Tools", "工具"],
    ["Dismiss", "关闭"],
    ["Security", "安全"],
    ["Switch account", "切换账号"],
    ["Author", "作者"],
    ["New chat", "新聊天"],
    ["Upload", "上传"],
    ["Routers", "路由器"],
    ["Finish Reason", "结束原因"],
  ]) {
    assert.equal(dict[key], value, `dictionary entry added: ${key}`);
    assert.equal(translate(key), value, `translate must apply new entry: ${key}`);
  }
}

console.log("Remote preview tests passed: 1391 entries, migration, fallback, cache, cooldown, hot update, title update, bad JSON, HTTP failure, normalization freeze fix, new regex rules.");
