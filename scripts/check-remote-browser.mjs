import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const userscript = readFileSync(new URL("../src/openrouter-chinese-remote.user.js", import.meta.url), "utf8");
const dictionary = JSON.parse(readFileSync(new URL("../locales/zh-CN.json", import.meta.url), "utf8"));

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  const context = await browser.newContext();
  await context.route("https://openrouter.ai/**", (route) => route.fulfill({
    status: 200,
    contentType: "text/html; charset=utf-8",
    body: '<!doctype html><html><head><title>API Keys | Settings | OpenRouter</title></head>' +
      '<body><button id="main">One API for Any Model</button>' +
      '<span id="api-keys">API Keys</span>' +
      '<input id="input" placeholder="Create Workspace"></body></html>',
  }));

  const page = await context.newPage();
  await page.addInitScript((payload) => {
    const values = Object.create(null);
    window.__fakeGM = { requests: 0, reply: payload, status: 200, values };
    window.GM_getValue = (key, fallback) => Object.hasOwn(values, key) ? values[key] : fallback;
    window.GM_setValue = (key, value) => { values[key] = value; };
    window.GM_registerMenuCommand = (_, cb) => { window.__dictionaryMenu = cb; };
    window.GM_xmlhttpRequest = (options) => {
      window.__fakeGM.requests++;
      options.onload({ status: window.__fakeGM.status, responseText: window.__fakeGM.reply });
    };
  }, JSON.stringify(dictionary));

  await page.goto("https://openrouter.ai/settings");
  await page.addScriptTag({ content: userscript });

  await page.waitForFunction((expected) => document.querySelector("#main")?.textContent === expected,
    dictionary["One API for Any Model"], { timeout: 12000 });
  assert.equal(await page.locator("#api-keys").textContent(), "API 密钥");
  assert.equal(await page.locator("#input").getAttribute("placeholder"), "创建工作区");
  assert.equal(await page.title(), "API 密钥 | 设置 | OpenRouter");
  assert.equal(await page.evaluate(() => window.__fakeGM.requests), 1);

  // Reactive DOM additions on the existing route.
  await page.evaluate(() => {
    const el = document.createElement("span");
    el.id = "dynamic";
    el.textContent = "Default Provider Sort";
    document.body.appendChild(el);
  });
  await page.waitForFunction((expected) => document.querySelector("#dynamic")?.textContent === expected,
    dictionary["Default Provider Sort"], { timeout: 5000 });

  // Route changes: React-style history.pushState and subsequent DOM additions.
  await page.evaluate(() => {
    history.pushState({}, "", "/models");
    const el = document.createElement("span");
    el.id = "route-element";
    el.textContent = "Monthly Tokens";
    document.body.appendChild(el);
  });
  await page.waitForFunction((expected) => document.querySelector("#route-element")?.textContent === expected,
    dictionary["Monthly Tokens"], { timeout: 5000 });

  // Remote hot updates preserve source English rather than retranslating old Chinese.
  const updated = { ...dictionary,
    "One API for Any Model": "热更新测试通过",
    "API Keys | Settings | OpenRouter": "标题热更新测试通过",
  };
  await page.evaluate(async (payload) => {
    window.__fakeGM.reply = payload;
    await window.__openrouterChineseRemote.refreshDictionary(true);
  }, JSON.stringify(updated));
  assert.equal(await page.locator("#main").textContent(), "热更新测试通过");
  assert.equal(await page.title(), "标题热更新测试通过");

  // Invalid response must retain the previous effective dictionary.
  await page.evaluate(async () => {
    window.__fakeGM.reply = "{}";
    await window.__openrouterChineseRemote.refreshDictionary(true);
  });
  assert.equal(await page.locator("#main").textContent(), "热更新测试通过");

  console.log("Chromium DOM tests passed: text, attributes, title, React-style route changes, dynamic nodes, hot update, invalid response.");
} finally {
  await browser.close();
}
