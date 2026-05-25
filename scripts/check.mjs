import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import vm from "node:vm";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const source = path.join(rootDir, "src", "openrouter-workspaces-zh.user.js");
const output = path.join(rootDir, "dist", "openrouter-workspaces-zh.user.js");

const syntax = spawnSync(process.execPath, ["--check", source], {
  cwd: rootDir,
  encoding: "utf8",
});
assert.equal(
  syntax.status,
  0,
  `expected userscript syntax check to pass\nstdout:\n${syntax.stdout}\nstderr:\n${syntax.stderr}`,
);

const build = spawnSync(process.execPath, ["scripts/build.mjs"], {
  cwd: rootDir,
  encoding: "utf8",
});
assert.equal(
  build.status,
  0,
  `expected build to pass\nstdout:\n${build.stdout}\nstderr:\n${build.stderr}`,
);
assert.equal(existsSync(output), true, "expected dist userscript to exist");

const code = readFileSync(output, "utf8");
assert.match(code, /==UserScript==/);
assert.match(code, /@name\s+OpenRouter Workspaces Chinese/);
assert.match(code, /@match\s+https:\/\/openrouter\.ai\/workspaces\*/);
assert.match(code, /@match\s+https:\/\/openrouter\.ai\/models\*/);
assert.match(code, /@match\s+https:\/\/openrouter\.ai\/apps\*/);
assert.match(code, /API 密钥/);
assert.match(code, /工作区/);
assert.match(code, /操作菜单/);
assert.match(code, /OpenRouter Workspaces Chinese userscript bootstrapped/);

const translate = loadTranslator(code);
const translationCases = [
  ["API Keys", "API 密钥"],
  ["Create and manage your API keys.", "创建并管理你的 API 密钥。"],
  ["Action menu", "操作菜单"],
  ["Create Workspace", "创建工作区"],
  ["Set spending limits, data privacy rules, and model/provider restrictions for", "为以下对象设置支出限额、数据隐私规则，以及模型/提供商限制："],
  ["API keys in this workspace.", "此工作区中的 API 密钥。"],
  ["Use your own provider API keys on OpenRouter", "在 OpenRouter 上使用你自己的提供商 API 密钥"],
  ["Key Priority and Fallback", "密钥优先级与回退"],
  ["Default Provider Sort", "默认提供商排序"],
  ["Default (balanced)", "默认（平衡）"],
  ["Price (cheapest first)", "价格（最便宜优先）"],
  ["Pin model", "固定模型"],
  ["Suggestions", "建议"],
  ["No presets yet", "还没有预设"],
  ["Configure Web Search", "配置网页搜索"],
  ["Auto (native if supported, otherwise Exa)", "自动（支持时使用原生，否则使用 Exa）"],
  ["Include Domains", "包含域名"],
  ["Exclude Domains", "排除域名"],
  ["Comma-separated. Supports wildcards.", "用英文逗号分隔，支持通配符。"],
  ["Configure PDF Inputs", "配置 PDF 输入"],
  ["PDF Parser Engine", "PDF 解析引擎"],
  ["Cloudflare AI (free, basic)", "Cloudflare AI（免费，基础）"],
  ["Configure Response Healing", "配置响应修复"],
  ["Input & Output Logging", "输入与输出日志"],
  ["Add Destination", "添加目标"],
  ["Video Generation", "视频生成"],
  ["Filter by User, Model, Provider, API Key, or Modality", "按用户、模型、提供商、API 密钥或模态筛选"],
  ["No transactions found", "未找到交易"],
  ["No management keys yet", "还没有管理密钥"],
  ["Zero Data Retention", "零数据保留"],
  ["Allowed Providers", "允许的提供商"],
  ["Enable analytics cookies", "启用分析 Cookie"],
  ["Give your guardrail a name, then configure the policies you want to enforce.", "为护栏命名，然后配置要强制执行的策略。"],
  ["Once saved, you can configure policies, assign members, and manage API keys from the guardrail detail page.", "保存后，你可以在护栏详情页配置策略、分配成员并管理 API 密钥。"],
  ["Guardrails | OpenRouter", "护栏 | OpenRouter"],
  ["Open navigation menu", "打开导航菜单"],
  ["Grey", "灰色"],
  ["Purple", "紫色"],
  ["Default Apr 26, 12:15 PM", "默认 Apr 26, 12:15 PM"],
  ["Short 4/26 12:15pm", "短格式 4/26 12:15pm"],
  ["Relative 3 hours ago", "相对时间 3 hours ago"],
  ["1 key", "1 个密钥"],
  ["2 guardrails", "2 个护栏"],
  ["38 models matched", "匹配 38 个模型"],
  ["Remaining credits: 0", "剩余额度：0"],
  ["I/O Logging Settings", "I/O 日志设置"],
  ["Save Preset", "保存预设"],
  ["Top Coding Agents", "热门编码 Agent"],
  ["Top", "热门"],
  ["Coding Agents", "编码 Agent"],
  ["Largest public apps and agents", "最大公开应用和 Agent"],
  ["Categories", "分类"],
  ["Input Modalities", "输入模态"],
  ["$1 /M input tokens", "$1 / 百万输入 Token"],
  ["$2 /M output tokens", "$2 / 百万输出 Token"],
  ["$1 /M input Token", "$1 / 百万输入 Token"],
  ["$2 /M output Token", "$2 / 百万输出 Token"],
  ["256K context", "256K 上下文"],
];

for (const [sourceText, expected] of translationCases) {
  assert.equal(translate(sourceText), expected, `expected translation for ${sourceText}`);
}

assert.equal(translate("sk-or-v1-ce2...fe3"), "sk-or-v1-ce2...fe3");
assert.equal(translate("isdoge@qq.com"), "isdoge@qq.com");

console.log("check passed");

function loadTranslator(code) {
  const context = {
    console,
    location: { hostname: "openrouter.ai" },
    history: {
      pushState() {},
      replaceState() {},
    },
    window: null,
    document: {
      readyState: "complete",
      body: {
        querySelectorAll() {
          return [];
        },
      },
      documentElement: {},
      createTreeWalker() {
        return {
          nextNode() {
            return null;
          },
        };
      },
      addEventListener() {},
    },
    NodeFilter: {
      SHOW_TEXT: 4,
      FILTER_REJECT: 2,
      FILTER_ACCEPT: 1,
    },
    MutationObserver: class {
      constructor() {}
      observe() {}
      disconnect() {}
    },
    requestAnimationFrame(callback) {
      callback();
    },
    setTimeout() {},
    URL,
  };
  context.window = {
    addEventListener() {},
    get __openrouterWorkspacesZh() {
      return context.__openrouterWorkspacesZh;
    },
    set __openrouterWorkspacesZh(value) {
      context.__openrouterWorkspacesZh = value;
    },
  };
  context.globalThis = context;

  vm.runInNewContext(code, context, {
    filename: "openrouter-workspaces-zh.user.js",
  });

  assert.equal(typeof context.__openrouterWorkspacesZh?.translate, "function");
  return context.__openrouterWorkspacesZh.translate;
}
