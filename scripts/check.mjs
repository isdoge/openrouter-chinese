import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import vm from "node:vm";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const source = path.join(rootDir, "src", "openrouter-chinese.user.js");
const output = path.join(rootDir, "dist", "openrouter-chinese.user.js");

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
assert.match(code, /@name\s+OpenRouter 中文化插件/);
assert.match(code, /@version\s+0\.1\.8/);
assert.match(code, /@match\s+https:\/\/openrouter\.ai\/\*/);
assert.match(code, /API 密钥/);
assert.match(code, /工作区/);
assert.match(code, /操作菜单/);
assert.match(code, /OpenRouter 中文化插件 bootstrapped/);

const { translate, context } = loadTranslator(code);
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
  ["API Key | Settings | OpenRouter", "API 密钥 | 设置 | OpenRouter"],
  ["Open navigation menu", "打开导航菜单"],
  ["Grey", "灰色"],
  ["Purple", "紫色"],
  ["Default Apr 26, 12:15 PM", "默认 Apr 26, 12:15 PM"],
  ["Short 4/26 12:15pm", "短格式 4/26 12:15pm"],
  ["Relative 3 hours ago", "相对时间 3 hours ago"],
  ["1 key", "1 个密钥"],
  ["2 guardrails", "2 个护栏"],
  ["4 models", "4 个模型"],
  ["38 models matched", "匹配 38 个模型"],
  ["Remaining credits: 0", "剩余额度：0"],
  ["Reset limit", "重置限额"],
  ["Total", "总计"],
  ["Metadata", "元数据"],
  ["Budgets", "预算"],
  ["No budget limits configured.", "未配置预算限制。"],
  ["Budget Policies", "预算策略"],
  ["Set spending limits and rate caps to control usage costs.", "设置支出限额和速率上限，以控制使用成本。"],
  ["Model & Provider Access", "模型与提供商访问"],
  ["4 allowed", "允许 4 个"],
  ["All allowed", "全部允许"],
  ["Prompt Injection", "提示词注入"],
  ["Detect and respond to prompt injection attempts.", "检测并响应提示词注入尝试。"],
  ["Sensitive Info Detection", "敏感信息检测"],
  ["Identify and handle PII, credentials, and personal data.", "识别并处理 PII、凭据和个人数据。"],
  ["Partial", "部分可用"],
  ["Unavailable", "不可用"],
  ["Account Settings", "账号设置"],
  ["models", "模型"],
  ["Expiration times cannot be modified. You must create a new API key to have a new expiration time.", "过期时间无法修改。你必须创建新的 API 密钥才能使用新的过期时间。"],
  ["Prevent this key from being used. You can re-enable it later.", "阻止此密钥被使用。你稍后可以重新启用它。"],
  ["Delete Key", "删除密钥"],
  ["Permanently delete this key. This action cannot be undone.", "永久删除此密钥。此操作无法撤销。"],
  ["N/A", "不适用"],
  ["Clear all", "清空全部"],
  ["Remove newkey", "移除 newkey"],
  ["View supported models", "查看支持的模型"],
  ["Add and configure your API keys. Drag a key by its handle to reorder it within a section or move it between sections.", "添加并配置你的 API 密钥。拖动密钥旁的手柄可在同一分区内重新排序，或移动到其他分区。"],
  ["Prioritized", "优先"],
  ["Attempted in order, before falling back to OpenRouter endpoints.", "会按顺序优先尝试，然后才会回退到 OpenRouter 端点。"],
  ["Add prioritized key", "添加优先密钥"],
  ["Add a prioritized key", "添加一个优先密钥"],
  ["Tried only after attempting OpenRouter endpoints, in order.", "仅会在尝试 OpenRouter 端点之后按顺序使用。"],
  ["Add fallback key", "添加回退密钥"],
  ["Add a fallback key", "添加一个回退密钥"],
  ["Alibaba BYOK | Settings | OpenRouter", "Alibaba BYOK | 设置 | OpenRouter"],
  ["Firecrawl provides web search and scraping capabilities for your OpenRouter requests. When enabled, models can search the web and extract content from URLs during inference.", "Firecrawl 为你的 OpenRouter 请求提供网页搜索和抓取能力。启用后，模型可以在推理过程中搜索网页并从 URL 提取内容。"],
  ["OpenRouter partners with Firecrawl to offer 10,000 free credits (which expire after 3 months). Accepting the Terms of Service below will create a Firecrawl account linked to your email and provision an API key automatically.", "OpenRouter 与 Firecrawl 合作提供 10,000 免费额度（3 个月后过期）。接受下方服务条款后，将自动创建一个与你邮箱绑定的 Firecrawl 账号并配置 API 密钥。"],
  ["Firecrawl offer: 10,000 free credits (expire after 3 months)", "Firecrawl 优惠：10,000 免费额度（3 个月后过期）"],
  ["I accept the", "我接受"],
  ["Firecrawl Terms of Service", "Firecrawl 服务条款"],
  ["I accept the Firecrawl Terms of Service", "我接受 Firecrawl 服务条款"],
  ["Accepting will create a Firecrawl account linked to your email address and apply the offer automatically.", "接受后将创建一个与你邮箱地址绑定的 Firecrawl 账号，并自动应用该优惠。"],
  ["These settings apply as defaults to all your API requests. Individual requests can override these settings using the", "这些设置会作为你所有 API 请求的默认值。单个请求仍可通过"],
  ["parameter, unless you enable \"Prevent overrides\" in the plugin configuration.", "参数覆盖这些设置，除非你在插件配置中启用“阻止覆盖”。"],
  ["These settings apply as defaults to all your API requests. Individual requests can override these settings using the plugins parameter, unless you enable \"Prevent overrides\" in the plugin configuration.", "这些设置会作为你所有 API 请求的默认值。单个请求仍可通过 plugins 参数覆盖这些设置，除非你在插件配置中启用“阻止覆盖”。"],
  ["View plugin documentation", "查看插件文档"],
  ["Pareto Router", "Pareto 路由器"],
  ["Set default coding quality tier for the Pareto code router", "为 Pareto 代码路由器设置默认编码质量档位"],
  ["Toggle Pareto Router", "切换 Pareto 路由器"],
  ["I/O Logging Settings", "I/O 日志设置"],
  ["Save Preset", "保存预设"],
  ["Top Coding Agents", "热门编码 Agent"],
  ["Top", "热门"],
  ["Coding Agents", "编码 Agent"],
  ["Largest public apps and agents", "最大公开应用和 Agent"],
  ["Categories", "分类"],
  ["Input Modalities", "输入模态"],
  ["The Unified Interface For LLMs", "大语言模型的统一接口"],
  ["Logo OpenRouter", "OpenRouter 徽标"],
  ["Personal Personal", "个人"],
  ["Personal 个人", "个人"],
  ["Better", "更低的"],
  ["Better prices, better uptime, no subscriptions.", "更低价格，更高可用性，无需订阅。"],
  [", better", "，更高的"],
  [", no subscriptions.", "，无需订阅。"],
  ["Get API Key", "获取 API 密钥"],
  ["Monthly Tokens", "月度 Token"],
  ["Global Users", "全球用户"],
  ["Weekly Trend", "周趋势"],
  ["by", "由"],
  ["active models on", "个活跃模型，来自"],
  ["providers", "个提供商"],
  ["One API for Any Model", "一个 API 适配任意模型"],
  ["Access all major models through a single, unified interface. OpenAI SDK works out of the box.", "通过单一统一接口访问所有主流模型。开箱即用兼容 OpenAI SDK。"],
  ["Browse all", "浏览全部"],
  ["Higher Availability", "更高可用性"],
  ["Reliable AI models via our distributed infrastructure. Fall back to other providers when one goes down.", "通过我们的分布式基础设施稳定访问 AI 模型。当某个提供商不可用时，会自动回退到其他提供商。"],
  ["Price and Performance", "价格与性能"],
  ["Keep costs in check without sacrificing speed. OpenRouter runs at the edge for minimal latency between your users and their inference.", "在不牺牲速度的前提下控制成本。OpenRouter 在边缘运行，尽可能降低用户与推理之间的延迟。"],
  ["Custom Data Policies", "自定义数据策略"],
  ["Protect your organization with fine grained data policies. Ensure prompts only go to the models and providers you trust.", "通过细粒度数据策略保护你的组织。确保提示词只发送给你信任的模型和提供商。"],
  ["View docs", "查看文档"],
  ["Featured Models", "精选模型"],
  ["View all", "查看全部"],
  ["Featured Agents", "精选 Agent"],
  ["Signup", "注册"],
  ["Sign Up", "注册"],
  ["Create an account to get started. You can set up an org for your team later.", "创建账号即可开始使用。之后也可以再为团队创建组织。"],
  ["Buy credits", "购买额度"],
  ["Credits can be used with any model or provider.", "额度可用于任意模型或提供商。"],
  ["Get your API key", "获取你的 API 密钥"],
  ["Create an API key and start making requests.", "创建一个 API 密钥并开始发起请求。"],
  ["Fully OpenAI compatible", "完全兼容 OpenAI"],
  ["Recent Announcements", "最新公告"],
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
context.__openrouterWorkspacesZh.run();
assert.equal(context.document.title, "护栏 | OpenRouter");
const { context: homeContext } = loadTranslator(code, {
  pathname: "/",
  title: "OpenRouter",
});
assert.equal(typeof homeContext.__openrouterWorkspacesZh?.run, "function");

console.log("check passed");

function loadTranslator(code, overrides = {}) {
  const context = {
    console,
    location: {
      hostname: "openrouter.ai",
      pathname: overrides.pathname ?? "/workspaces",
    },
    history: {
      pushState() {},
      replaceState() {},
    },
    window: null,
    document: {
      title: overrides.title ?? "Guardrails | OpenRouter",
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
    filename: "openrouter-chinese.user.js",
  });

  assert.equal(typeof context.__openrouterWorkspacesZh?.translate, "function");
  return {
    translate: context.__openrouterWorkspacesZh.translate,
    context,
  };
}
