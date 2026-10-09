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
assert.equal(Object.keys(dict).length, 1274, "migration should preserve all unique translations");

const match = old.match(/^  const EXACT_TEXT = new Map\(\[\r?\n([\s\S]*?)^  \]\);/m);
assert.ok(match, "original dictionary exists");
const recordRx = /^\s*\[("(?:[^"\\]|\\.)*"),\s*("(?:[^"\\]|\\.)*")\],?\s*$/;
const expected = new Map();
for (const line of match[1].split("\n").filter((line) => line.trim())) {
  const record = line.match(recordRx);
  assert.ok(record, "unrecognized original record: " + line);
  expected.set(JSON.parse(record[1]), JSON.parse(record[2]));
}
assert.deepEqual(dict, Object.fromEntries(expected), "all effective original translations must be identical");

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

console.log("Remote preview tests passed: 1274 entries, migration, fallback, cache, cooldown, hot update, title update, bad JSON, HTTP failure.");
