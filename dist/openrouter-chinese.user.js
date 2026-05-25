// ==UserScript==
// @name         OpenRouter Workspaces Chinese
// @namespace    https://github.com/isdoge/openrouter-chinese
// @version      0.1.2
// @description  Chinese localization for OpenRouter workspaces, account settings, menus, dialogs, and common overlays.
// @author       codex
// @license      MIT
// @homepageURL  https://github.com/isdoge/openrouter-chinese
// @supportURL   https://github.com/isdoge/openrouter-chinese/issues
// @downloadURL  https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/dist/openrouter-chinese.user.js
// @updateURL    https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/dist/openrouter-chinese.user.js
// @match        https://openrouter.ai/workspaces*
// @match        https://openrouter.ai/workspaces/*
// @match        https://openrouter.ai/settings/*
// @match        https://openrouter.ai/activity*
// @match        https://openrouter.ai/logs*
// @match        https://openrouter.ai/labs*
// @match        https://openrouter.ai/apps*
// @match        https://openrouter.ai/rankings*
// @match        https://openrouter.ai/chat*
// @match        https://openrouter.ai/fusion*
// @match        https://openrouter.ai/models*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const SCRIPT_NAME = "openrouter-chinese";
  const INITIAL_RUN_DELAY_MS = 1200;
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
  const EXACT_TEXT = new Map([
    ["Skip to content", "跳到内容"],
    ["Search", "搜索"],
    ["Search...", "搜索..."],
    ["Search by name...", "按名称搜索..."],
    ["Open navigation menu", "打开导航菜单"],
    ["OpenRouter", "OpenRouter"],
    ["Home", "首页"],
    ["Models", "模型"],
    ["Fusion", "融合"],
    ["Chat", "聊天"],
    ["Rankings", "排行榜"],
    ["Apps", "应用"],
    ["Docs", "文档"],
    ["Personal", "个人"],
    ["Default Workspace", "默认工作区"],
    ["Workspace", "工作区"],
    ["Workspaces", "工作区"],
    ["ACCOUNT", "账号"],
    ["Account", "账号"],
    ["Profile", "个人资料"],
    ["Activity", "活动"],
    ["Logs", "日志"],
    ["Credits", "余额"],
    ["Management Keys", "管理密钥"],
    ["Privacy", "隐私"],
    ["Preferences", "偏好设置"],
    ["Settings", "设置"],
    ["API Keys", "API 密钥"],
    ["Create and manage your API keys.", "创建并管理你的 API 密钥。"],
    ["New Key", "新建密钥"],
    ["Key", "密钥"],
    ["Guardrails", "护栏"],
    ["BYOK", "自带密钥 BYOK"],
    ["Routing", "路由"],
    ["Presets", "预设"],
    ["Plugins", "插件"],
    ["Observability", "可观测性"],
    ["Expires", "过期时间"],
    ["Last Used", "上次使用"],
    ["Usage", "用量"],
    ["Limit", "限额"],
    ["TOTAL", "总计"],
    ["Never", "从未"],
    ["Free", "免费"],
    ["free", "免费"],
    ["unlimited", "不限"],
    ["Information", "说明"],
    ["Action menu", "操作菜单"],
    ["Select all keys", "选择全部密钥"],
    ["Copy", "复制"],
    ["Copied", "已复制"],
    ["Edit", "编辑"],
    ["Rename", "重命名"],
    ["Delete", "删除"],
    ["Remove", "移除"],
    ["Cancel", "取消"],
    ["Close", "关闭"],
    ["Done", "完成"],
    ["Save", "保存"],
    ["Save changes", "保存更改"],
    ["Create", "创建"],
    ["Confirm", "确认"],
    ["Continue", "继续"],
    ["Back", "返回"],
    ["Next", "下一步"],
    ["Previous", "上一步"],
    ["Submit", "提交"],
    ["Update", "更新"],
    ["Regenerate", "重新生成"],
    ["Disable", "停用"],
    ["Enable", "启用"],
    ["Enabled", "已启用"],
    ["Disabled", "已停用"],
    ["Active", "活跃"],
    ["Inactive", "未活跃"],
    ["Name", "名称"],
    ["Description", "描述"],
    ["Created", "创建时间"],
    ["Created At", "创建时间"],
    ["Updated", "更新时间"],
    ["Status", "状态"],
    ["Type", "类型"],
    ["Provider", "提供商"],
    ["Model", "模型"],
    ["Models", "模型"],
    ["All", "全部"],
    ["None", "无"],
    ["Default", "默认"],
    ["Grey", "灰色"],
    ["Gray", "灰色"],
    ["Green", "绿色"],
    ["Yellow", "黄色"],
    ["Orange", "橙色"],
    ["Pink", "粉色"],
    ["Purple", "紫色"],
    ["Custom", "自定义"],
    ["Optional", "可选"],
    ["Required", "必填"],
    ["Advanced", "高级"],
    ["General", "通用"],
    ["Overview", "概览"],
    ["Details", "详情"],
    ["Filter", "筛选"],
    ["Filters", "筛选器"],
    ["Clear", "清除"],
    ["Clear filters", "清除筛选"],
    ["Refresh", "刷新"],
    ["Reload", "重新加载"],
    ["Download", "下载"],
    ["Export", "导出"],
    ["Import", "导入"],
    ["More", "更多"],
    ["More options", "更多选项"],
    ["View", "查看"],
    ["View details", "查看详情"],
    ["Learn more", "了解更多"],
    ["Documentation", "文档"],
    ["Suggestions", "建议"],
    ["No results", "没有结果"],
    ["No results found", "未找到结果"],
    ["No data", "暂无数据"],
    ["Loading...", "正在加载..."],
    ["Something went wrong", "出现错误"],
    ["Try again", "重试"],
    ["Add", "添加"],
    ["Add Key", "添加密钥"],
    ["Add Provider", "添加提供商"],
    ["Add Route", "添加路由"],
    ["Add Preset", "添加预设"],
    ["Add Plugin", "添加插件"],
    ["Create Key", "创建密钥"],
    ["Create API Key", "创建 API 密钥"],
    ["API Key", "API 密钥"],
    ["API key", "API 密钥"],
    ["API key name", "API 密钥名称"],
    ["Key Name", "密钥名称"],
    ["Secret", "密钥"],
    ["Token", "令牌"],
    ["Limit usage", "限制用量"],
    ["Credit limit", "余额限额"],
    ["Monthly limit", "月度限额"],
    ["No limit", "不设限额"],
    ["Expiration", "过期时间"],
    ["Expiration date", "过期日期"],
    ["Expires at", "过期时间"],
    ["Never expires", "永不过期"],
    ["Guardrail", "护栏"],
    ["Add Guardrail", "添加护栏"],
    ["Create Guardrail", "创建护栏"],
    ["No guardrails", "没有护栏"],
    ["Moderation", "审核"],
    ["Input", "输入"],
    ["Output", "输出"],
    ["Prompt", "提示词"],
    ["Response", "响应"],
    ["BYOK Keys", "自带密钥 BYOK"],
    ["Bring Your Own Key", "自带密钥"],
    ["Connect Provider", "连接提供商"],
    ["Provider Key", "提供商密钥"],
    ["Routing Rules", "路由规则"],
    ["Fallback", "回退"],
    ["Fallbacks", "回退"],
    ["Priority", "优先级"],
    ["Weights", "权重"],
    ["Load balancing", "负载均衡"],
    ["Preset", "预设"],
    ["Prompt Presets", "提示词预设"],
    ["Plugin", "插件"],
    ["Installed", "已安装"],
    ["Install", "安装"],
    ["Uninstall", "卸载"],
    ["Observability Settings", "可观测性设置"],
    ["Logs retention", "日志保留"],
    ["Workspace Settings", "工作区设置"],
    ["Workspace name", "工作区名称"],
    ["Members", "成员"],
    ["Invite", "邀请"],
    ["Invite member", "邀请成员"],
    ["Role", "角色"],
    ["Owner", "所有者"],
    ["Admin", "管理员"],
    ["Member", "成员"],
    ["Email", "邮箱"],
    ["User", "用户"],
    ["Users", "用户"],
    ["Organization", "组织"],
    ["Billing", "账单"],
    ["Balance", "余额"],
    ["Add credits", "充值"],
    ["Payment method", "付款方式"],
    ["Invoices", "发票"],
    ["Usage limit", "用量限额"],
    ["Spend limit", "支出限额"],
    ["This month", "本月"],
    ["Last month", "上月"],
    ["Today", "今天"],
    ["Yesterday", "昨天"],
    ["Last 7 days", "过去 7 天"],
    ["Last 30 days", "过去 30 天"],
    ["Request ID", "请求 ID"],
    ["Timestamp", "时间戳"],
    ["Cost", "费用"],
    ["Latency", "延迟"],
    ["Tokens", "Token 数"],
    ["Prompt tokens", "提示词 Token"],
    ["Completion tokens", "补全 Token"],
    ["Total tokens", "总 Token"],
    ["Error", "错误"],
    ["Errors", "错误"],
    ["Success", "成功"],
    ["Failed", "失败"],
    ["Pending", "待处理"],
    ["Processing", "处理中"],
    ["Public", "公开"],
    ["Private", "私有"],
    ["Theme", "主题"],
    ["System", "跟随系统"],
    ["Light", "浅色"],
    ["Dark", "深色"],
    ["Language", "语言"],
    ["Notifications", "通知"],
    ["Create Workspace", "创建工作区"],
    ["Labs", "实验室"],
    ["Product", "产品"],
    ["Pricing", "价格"],
    ["Enterprise", "企业"],
    ["Company", "公司"],
    ["About", "关于"],
    ["Announcements", "公告"],
    ["Careers", "招聘"],
    ["Hiring", "正在招聘"],
    ["Terms of Service", "服务条款"],
    ["Support", "支持"],
    ["State of AI", "AI 状态"],
    ["Works With OR", "适配 OpenRouter"],
    ["Data", "数据"],
    ["Developer", "开发者"],
    ["API Reference", "API 参考"],
    ["SDK", "SDK"],
    ["Connect", "连接"],
    ["Discord", "Discord"],
    ["GitHub", "GitHub"],
    ["LinkedIn", "LinkedIn"],
    ["YouTube", "YouTube"],
    ["Logo", "徽标"],
    ["OpenRouter Logo", "OpenRouter 徽标"],
    ["Notifications", "通知"],
    ["Sign Out", "退出登录"],
    ["Choose a clear and descriptive name.", "选择一个清晰且便于识别的名称。"],
    ["Credit limit (optional)", "余额限额（可选）"],
    ["Once the credits (in $USD) consumed by this API key sum to this amount or more, it will no longer work. Leave blank for no limit.", "当此 API 密钥消耗的积分（美元）累计达到或超过该金额后，它将停止工作。留空表示不设限额。"],
    ["Reset limit every...", "每隔多久重置限额..."],
    ["N/A", "不适用"],
    ["Choose when this API key should expire. Select \"No expiration\" for a key that never expires.", "选择此 API 密钥的过期时间。选择“永不过期”可创建不会过期的密钥。"],
    ["No expiration", "永不过期"],
    ["1 hour", "1 小时"],
    ["1 day", "1 天"],
    ["7 days", "7 天"],
    ["30 days", "30 天"],
    ["90 days", "90 天"],
    ["180 days", "180 天"],
    ["1 year", "1 年"],
    ["Manage your workspaces and their configurations.", "管理你的工作区及其配置。"],
    ["Your API keys and configurations now live in Workspaces", "你的 API 密钥和配置现在已迁移到工作区"],
    ["We've moved your existing API keys, guardrails, and other configurations into your", "我们已将你现有的 API 密钥、护栏和其他配置迁移到你的"],
    ["Default workspace", "默认工作区"],
    ["Everything works exactly as before — workspaces just give you a way to organize different projects with their own keys, budgets, and rules.", "一切都会像以前一样工作，工作区只是让你能按不同项目组织各自的密钥、预算和规则。"],
    ["Go to your Default Workspace", "前往默认工作区"],
    ["View your API Keys", "查看你的 API 密钥"],
    ["The initial workspace for your account. Includes all API Keys, Presets, and other configurations previously created.", "账号的初始工作区，包含之前创建的所有 API 密钥、预设和其他配置。"],
    ["Set spending limits, data privacy rules, and model/provider restrictions for", "为以下对象设置支出限额、数据隐私规则，以及模型/提供商限制："],
    ["API keys in this workspace.", "此工作区中的 API 密钥。"],
    ["New Guardrail", "新建护栏"],
    ["Filter guardrails by status", "按状态筛选护栏"],
    ["Policies", "策略"],
    ["Workspace Guardrail", "工作区护栏"],
    ["Default policy automatically applied to all keys in this workspace.", "自动应用于此工作区所有密钥的默认策略。"],
    ["No policies", "没有策略"],
    ["guardrails", "护栏"],
    ["Use your own provider API keys on OpenRouter", "在 OpenRouter 上使用你自己的提供商 API 密钥"],
    ["Providers", "提供商"],
    ["Web Search", "网页搜索"],
    ["Available", "可用"],
    ["Not configured", "未配置"],
    ["Show 47 more", "再显示 47 个"],
    ["Key Priority and Fallback", "密钥优先级与回退"],
    ["OpenRouter always prioritizes using your provider keys when available.", "当你的提供商密钥可用时，OpenRouter 会优先使用它们。"],
    ["By default, if your key encounters a rate limit or failure, OpenRouter will fall back to using shared OpenRouter endpoints.", "默认情况下，如果你的密钥遇到速率限制或失败，OpenRouter 会回退到共享的 OpenRouter 端点。"],
    ["You can configure individual keys with \"Always use this key\" to prevent any fallback to OpenRouter endpoints. When this option is enabled, OpenRouter will only use your key for requests to that provider. This may result in rate limit errors if your key is exhausted, but ensures all requests go through your account.", "你可以为单个密钥配置“始终使用此密钥”，阻止回退到 OpenRouter 端点。启用后，OpenRouter 对该提供商的请求只会使用你的密钥。如果密钥额度耗尽，可能产生速率限制错误，但能确保所有请求都经过你的账号。"],
    ["If you wish to never use shared OpenRouter endpoints for a model, you must", "如果你希望某个模型永远不使用共享 OpenRouter 端点，必须"],
    ["both", "同时"],
    ["specify \"Always use this key\" and pin the provider by specifying it as", "指定“始终使用此密钥”，并通过将提供商设为"],
    ["your only provider", "唯一提供商"],
    ["when making the request.", "来固定请求时使用的提供商。"],
    ["Auto Router", "自动路由器"],
    ["Configure which models the Auto Router can route to.", "配置自动路由器可以路由到哪些模型。"],
    ["Route to the best model for each request using", "使用以下模型为每个请求路由到最佳模型："],
    ["Allowed Models", "允许的模型"],
    ["Model patterns to filter which models the auto-router can route between. Separate patterns with commas or newlines. Supports wildcards (e.g., \"anthropic/*\" matches all Anthropic models). Leave empty to use all supported models.", "用于筛选自动路由器可路由模型的模型模式。可用逗号或换行分隔，支持通配符（例如“anthropic/*”匹配所有 Anthropic 模型）。留空表示使用所有支持的模型。"],
    ["Prevent overrides", "阻止覆盖"],
    ["Prevent individual API requests from overriding this setting using the plugins parameter.", "阻止单个 API 请求通过 plugins 参数覆盖此设置。"],
    ["Default Provider Sort", "默认提供商排序"],
    ["Choose how providers should be sorted for your requests.", "选择请求中提供商的排序方式。"],
    ["Choose how providers should be sorted. Individual requests can override this setting.", "选择提供商的排序方式。单个请求可以覆盖此设置。"],
    ["By default, OpenRouter balances low prices with high uptime.", "默认情况下，OpenRouter 会在低价格和高可用性之间平衡。"],
    ["Default (balanced)", "默认（平衡）"],
    ["Price (cheapest first)", "价格（最便宜优先）"],
    ["Throughput (highest first)", "吞吐量（最高优先）"],
    ["Latency (lowest first)", "延迟（最低优先）"],
    ["Exacto (tool-call quality first)", "Exacto（工具调用质量优先）"],
    ["Default Model", "默认模型"],
    ["Set the default model for apps and fallback routing.", "设置应用和回退路由使用的默认模型。"],
    ["Apps will use this model by default, but they may override it if they choose to do so.", "应用默认使用此模型，但也可以自行覆盖。"],
    ["This model will also be used as your default", "此模型也会作为你的默认"],
    ["fallback model", "回退模型"],
    ["No default", "无默认值"],
    ["Pin model", "固定模型"],
    ["Presets are shortcuts for your system prompts, model and provider configurations, and request parameters.", "预设是系统提示词、模型与提供商配置、请求参数的快捷方式。"],
    ["New Preset", "新建预设"],
    ["Save Preset", "保存预设"],
    ["Basic Info", "基本信息"],
    ["Preset name and description for identification and organization.", "用于识别和组织的预设名称与描述。"],
    ["Slug", "标识符"],
    ["System Prompt", "系统提示词"],
    ["Model Selection (Optional)", "模型选择（可选）"],
    ["Specify which model(s) this preset should use. Leave empty to allow any model. If multiple models are selected, they will be used as fallbacks.", "指定此预设应使用的模型。留空表示允许任意模型。如果选择多个模型，它们将作为回退模型使用。"],
    ["Add model", "添加模型"],
    ["Provider Routing", "提供商路由"],
    ["Control which providers are used and routing preferences.", "控制使用哪些提供商以及路由偏好。"],
    ["Provider Preferences", "提供商偏好"],
    ["Configure provider routing preferences like allowed/ignored providers, fallbacks, etc.", "配置允许/忽略的提供商、回退等提供商路由偏好。"],
    ["Include Provider Preferences", "包含提供商偏好"],
    ["sort", "排序"],
    ["The sorting strategy to use for this request, if \"order\" is not specified. When set, no load balancing is performed.", "当未指定“order”时，此请求使用的排序策略。设置后将不执行负载均衡。"],
    ["price", "价格"],
    ["throughput", "吞吐量"],
    ["latency", "延迟"],
    ["data_collection", "数据收集"],
    ["Data collection setting. If no available model provider meets the requirement, your request will return an error. - allow: (default) allow providers which store user data non-transiently and may train on it - deny: use only providers which do not collect user data.", "数据收集设置。如果没有可用模型提供商满足要求，请求将返回错误。allow：（默认）允许会非临时存储用户数据并可能用于训练的提供商；deny：仅使用不收集用户数据的提供商。"],
    ["deny", "拒绝"],
    ["allow", "允许"],
    ["order", "顺序"],
    ["An ordered list of provider slugs. The router will attempt to use the first provider in the subset of this list that supports your requested model, and fall back to the next if it is unavailable. If no providers are available, the request will fail with an error message.", "提供商标识符的有序列表。路由器会尝试使用此列表中支持请求模型的第一个提供商；如果不可用则回退到下一个。如果没有可用提供商，请求将失败并返回错误消息。"],
    ["only", "仅允许"],
    ["List of provider slugs to allow. If provided, this list is merged with your account-wide allowed provider settings for this request.", "允许的提供商标识符列表。提供后，此列表会与账号级允许提供商设置合并用于本次请求。"],
    ["ignore", "忽略"],
    ["List of provider slugs to ignore. If provided, this list is merged with your account-wide ignored provider settings for this request.", "要忽略的提供商标识符列表。提供后，此列表会与账号级忽略提供商设置合并用于本次请求。"],
    ["quantizations", "量化等级"],
    ["A list of quantization levels to filter the provider by.", "用于筛选提供商的量化等级列表。"],
    ["unknown", "未知"],
    ["max_price", "最高价格"],
    ["The object specifying the maximum price you want to pay for this request. USD price per million tokens, for prompt and completion.", "指定本次请求愿意支付的最高价格。单位为每百万 Token 的美元价格，分别对应提示词和补全。"],
    ["Prompt:", "提示词："],
    ["Completion:", "补全："],
    ["preferred_min_throughput", "偏好最低吞吐量"],
    ["Preferred minimum throughput (in tokens per second). Can be a number (applies to p50) or an object with percentile-specific cutoffs. Endpoints below the threshold(s) may still be used, but are deprioritized in routing. When using fallback models, this may cause a fallback model to be used instead of the primary model if it meets the threshold.", "偏好的最低吞吐量（Token/秒）。可以是数字（应用于 p50）或包含各百分位阈值的对象。低于阈值的端点仍可能被使用，但路由优先级会降低。使用回退模型时，如果回退模型满足阈值，可能会优先使用回退模型而非主模型。"],
    ["preferred_max_latency", "偏好最高延迟"],
    ["Preferred maximum latency (in seconds). Can be a number (applies to p50) or an object with percentile-specific cutoffs. Endpoints above the threshold(s) may still be used, but are deprioritized in routing. When using fallback models, this may cause a fallback model to be used instead of the primary model if it meets the threshold.", "偏好的最高延迟（秒）。可以是数字（应用于 p50）或包含各百分位阈值的对象。高于阈值的端点仍可能被使用，但路由优先级会降低。使用回退模型时，如果回退模型满足阈值，可能会优先使用回退模型而非主模型。"],
    ["Allow fallbacks", "允许回退"],
    ["Require parameters", "要求参数"],
    ["undefined", "未定义"],
    ["Parameters", "参数"],
    ["Override default generation settings like temperature and max tokens.", "覆盖温度、最大 Token 数等默认生成设置。"],
    ["Configure model parameters like temperature, max tokens, etc. These will override default values when the preset is used. Check the boxes next to parameters you want to include in this preset.", "配置温度、最大 Token 数等模型参数。使用此预设时，这些参数会覆盖默认值。勾选要包含在此预设中的参数。"],
    ["Temperature", "温度"],
    ["Include", "包含"],
    ["Controls randomness in the output. Lower values are more deterministic.", "控制输出随机性。数值越低，结果越确定。"],
    ["Top P", "Top P"],
    ["Nucleus sampling parameter. Controls diversity via cumulative probability.", "核采样参数。通过累计概率控制多样性。"],
    ["Top K", "Top K"],
    ["Limits the number of highest probability tokens to consider.", "限制参与考虑的最高概率 Token 数。"],
    ["Frequency Penalty", "频率惩罚"],
    ["Reduces repetition based on token frequency in the text so far.", "根据目前文本中的 Token 频率减少重复。"],
    ["Presence Penalty", "存在惩罚"],
    ["Reduces repetition based on whether tokens appear in the text so far.", "根据 Token 是否已在目前文本中出现来减少重复。"],
    ["Repetition Penalty", "重复惩罚"],
    ["Penalizes repetition. Values > 1 discourage repetition, < 1 encourage it.", "惩罚重复。数值大于 1 会抑制重复，小于 1 会鼓励重复。"],
    ["Max Tokens", "最大 Token 数"],
    ["Maximum number of tokens to generate.", "要生成的最大 Token 数。"],
    ["Random seed for deterministic outputs (when supported).", "用于确定性输出的随机种子（支持时生效）。"],
    ["Verbosity", "详细程度"],
    ["Medium", "中等"],
    ["Controls response detail level. Only supported by OpenAI and Anthropic models; other models will ignore this parameter.", "控制响应详细程度。仅 OpenAI 和 Anthropic 模型支持，其他模型会忽略此参数。"],
    ["Caching", "缓存"],
    ["Configure request caching to reduce costs and latency for repeated requests.", "配置请求缓存，以降低重复请求的成本和延迟。"],
    ["Request Caching", "请求缓存"],
    ["Enable Caching", "启用缓存"],
    ["When enabled, repeated identical requests will be served from cache.", "启用后，重复的相同请求将从缓存返回。"],
    ["Cache TTL", "缓存 TTL"],
    ["How long to cache responses (default: 5m)", "响应缓存时长（默认 5 分钟）"],
    ["Reasoning", "推理"],
    ["Configure reasoning (thinking) parameters for models that support extended reasoning.", "为支持扩展推理的模型配置推理参数。"],
    ["Configure reasoning (thinking) parameters for models that support extended reasoning capabilities. These settings control how the model reasons through problems.", "为支持扩展推理能力的模型配置推理参数。这些设置控制模型如何推理问题。"],
    ["Note: These settings only apply to models that support reasoning (e.g., GPT-5, Claude, and Gemini models). They will be ignored when the preset is used with non-reasoning models.", "注意：这些设置仅适用于支持推理的模型（例如 GPT-5、Claude 和 Gemini 模型）。与非推理模型一起使用此预设时会被忽略。"],
    ["Enable Reasoning", "启用推理"],
    ["Enable extended reasoning for models that support it (e.g., GPT-5, Claude, Gemini).", "为支持扩展推理的模型启用推理（例如 GPT-5、Claude、Gemini）。"],
    ["Reasoning Effort", "推理强度"],
    ["Controls how much reasoning the model performs. Higher effort may produce better results but uses more tokens.", "控制模型执行多少推理。更高强度可能产生更好结果，但会消耗更多 Token。"],
    ["Reasoning Max Tokens", "推理最大 Token 数"],
    ["Maximum number of tokens for reasoning. Cannot be used together with effort level.", "用于推理的最大 Token 数。不能与推理强度同时使用。"],
    ["Exclude Reasoning from Response", "从响应中排除推理"],
    ["Exclude", "排除"],
    ["When enabled, reasoning tokens will not be included in the response output.", "启用后，推理 Token 不会包含在响应输出中。"],
    ["No presets yet", "还没有预设"],
    ["Create a preset to save your model + parameter configuration.", "创建预设以保存你的模型和参数配置。"],
    ["Default Plugin Settings", "默认插件设置"],
    ["Configure default plugin behavior for your API requests.", "配置 API 请求的默认插件行为。"],
    ["Augment LLM responses with real-time web search results", "用实时网页搜索结果增强大语言模型响应"],
    ["Configure", "配置"],
    ["PDF Inputs", "PDF 输入"],
    ["Parse and extract content from uploaded PDF files", "解析并提取已上传 PDF 文件中的内容"],
    ["Response Healing", "响应修复"],
    ["Automatically fix malformed JSON responses from LLMs", "自动修复大语言模型返回的格式错误 JSON"],
    ["Toggle Response Healing", "切换响应修复"],
    ["Configure Web Search", "配置网页搜索"],
    ["Engine", "引擎"],
    ["Domain Filters", "域名过滤"],
    ["Search Engine", "搜索引擎"],
    ["Auto (native if supported, otherwise Exa)", "自动（支持时使用原生，否则使用 Exa）"],
    ["Native (provider-specific)", "原生（提供商特定）"],
    ["Exa", "Exa"],
    ["Firecrawl", "Firecrawl"],
    ["Parallel", "Parallel"],
    ["Max Results", "最大结果数"],
    ["Maximum number of search results to include (1-20). See docs for default.", "要包含的最大搜索结果数（1-20）。默认值见文档。"],
    ["Search Prompt", "搜索提示词"],
    ["Custom prompt injected with search results. Default instructs the model to incorporate results and cite sources using markdown links.", "随搜索结果注入的自定义提示词。默认提示会要求模型整合结果，并用 Markdown 链接引用来源。"],
    ["Include Domains", "包含域名"],
    ["Exclude Domains", "排除域名"],
    ["Comma-separated. Supports wildcards.", "用英文逗号分隔，支持通配符。"],
    ["Configure PDF Inputs", "配置 PDF 输入"],
    ["PDF Parser Engine", "PDF 解析引擎"],
    ["Default (Mistral OCR)", "默认（Mistral OCR）"],
    ["Choose the PDF parsing engine. Mistral OCR provides the best quality but has a cost.", "选择 PDF 解析引擎。Mistral OCR 质量最好，但会产生费用。"],
    ["Mistral OCR (recommended)", "Mistral OCR（推荐）"],
    ["Cloudflare AI (free, basic)", "Cloudflare AI（免费，基础）"],
    ["Configure Response Healing", "配置响应修复"],
    ["Input & Output Logging", "输入与输出日志"],
    ["Beta", "测试版"],
    ["Show prompts and completions in your", "在你的"],
    ["logs", "日志"],
    ["for debugging, evaluating responses, and optimizing prompts.", "中显示提示词和补全内容，用于调试、评估响应和优化提示词。"],
    ["I/O logging settings", "I/O 日志设置"],
    ["I/O Logging Settings", "I/O 日志设置"],
    ["Sampling", "采样"],
    ["Control what percentage of requests have their inputs and outputs logged.", "控制记录输入和输出的请求比例。"],
    ["Rate", "比例"],
    ["Included API Keys", "包含的 API 密钥"],
    ["Optionally enable I/O logging only for specific keys. Leave empty to include all.", "可选择仅为特定密钥启用 I/O 日志。留空表示包含全部。"],
    ["All API keys", "全部 API 密钥"],
    ["The probability of a request's input/output being logged. Setting 0.25 means only ~25% of requests will have their I/O logged.", "请求输入/输出被记录的概率。设置为 0.25 表示只有约 25% 的请求会记录 I/O。"],
    ["Select which API keys to include in I/O logging. If no keys are selected, all API keys will be included.", "选择要包含在 I/O 日志中的 API 密钥。如果未选择密钥，将包含全部 API 密钥。"],
    ["Toggle prompt storage", "切换提示词存储"],
    ["Broadcast", "广播"],
    ["Automatically send traces from your requests to external observability platforms without additional instrumentation.", "无需额外埋点，自动将请求追踪发送到外部可观测性平台。"],
    ["Toggle observability broadcast features", "切换可观测性广播功能"],
    ["Add Destination", "添加目标"],
    ["Send Feedback", "发送反馈"],
    ["Let us know how we can improve!", "告诉我们哪里可以改进！"],
    ["Open", "打开"],
    ["Copy to clipboard", "复制到剪贴板"],
    ["Enable 1% discount on all LLMs", "为所有大语言模型启用 1% 折扣"],
    ["This setting is disabled because data discount logging is not allowed at the account level. Enable it in Privacy settings first.", "此设置已禁用，因为账号级别不允许数据折扣日志记录。请先在隐私设置中启用。"],
    ["Toggle data discount logging", "切换数据折扣日志记录"],
    ["Video Generation", "视频生成"],
    ["Default Webhook URL", "默认 Webhook URL"],
    ["Receives video generation delivery events for this workspace.", "接收此工作区的视频生成交付事件。"],
    ["Webhook Signing Secret", "Webhook 签名密钥"],
    ["Used to verify webhook payload signatures.", "用于验证 Webhook 载荷签名。"],
    ["No signing secret configured.", "未配置签名密钥。"],
    ["Generate signing secret", "生成签名密钥"],
    ["Your usage across models on OpenRouter", "你在 OpenRouter 各模型上的使用情况"],
    ["Filter by User, Model, or API Key", "按用户、模型或 API 密钥筛选"],
    ["Filter by User, Model, Provider, API Key, or Modality", "按用户、模型、提供商、API 密钥或模态筛选"],
    ["1 Month", "1 个月"],
    ["By Model", "按模型"],
    ["View Logs", "查看日志"],
    ["Spend", "支出"],
    ["Requests", "请求"],
    ["Guardrail Enforcement", "护栏执行"],
    ["Blocked Requests", "已阻止请求"],
    ["Rejected before reaching the model", "在到达模型前已拒绝"],
    ["Redacted & Flagged", "已遮盖和已标记"],
    ["Content modified or logged for review", "内容已修改或记录以供审查"],
    ["Expand chart", "展开图表"],
    ["View your request logs and history.", "查看你的请求日志和历史记录。"],
    ["Past 1 Day", "过去 1 天"],
    ["Date range", "日期范围"],
    ["Generations", "生成"],
    ["Jobs", "任务"],
    ["Sessions", "会话"],
    ["No request volume for this period.", "此时间段没有请求量。"],
    ["No transactions found", "未找到交易"],
    ["Try adjusting the date range or filters to see more data.", "尝试调整日期范围或筛选条件以查看更多数据。"],
    ["Personal Account", "个人账号"],
    ["Remaining credits", "剩余额度"],
    ["Buy Credits", "购买额度"],
    ["Use crypto", "使用加密货币"],
    ["Pay with crypto", "使用加密货币支付"],
    ["Add Credits", "充值额度"],
    ["View Usage", "查看用量"],
    ["Redeem Promo Code", "兑换优惠码"],
    ["Auto Top-Up", "自动充值"],
    ["Add a Payment Method", "添加付款方式"],
    ["To activate auto-top-up, you'll need a payment method that supports offline charging.", "要启用自动充值，需要添加支持离线扣款的付款方式。"],
    ["Recent Transactions", "最近交易"],
    ["Need enterprise billing options?", "需要企业账单选项？"],
    ["Contact sales", "联系销售"],
    ["Date", "日期"],
    ["Amount", "金额"],
    ["Actions", "操作"],
    ["Control your management API keys for administrative actions", "管理用于管理操作的管理 API 密钥"],
    ["No management keys yet", "还没有管理密钥"],
    ["Create a management API key to perform administrative actions and manage inference API keys programmatically.", "创建管理 API 密钥，以编程方式执行管理操作并管理推理 API 密钥。"],
    ["Give your guardrail a name, then configure the policies you want to enforce.", "为护栏命名，然后配置要强制执行的策略。"],
    ["Once saved, you can configure policies, assign members, and manage API keys from the guardrail detail page.", "保存后，你可以在护栏详情页配置策略、分配成员并管理 API 密钥。"],
    ["Restrictions to apply globally across the account. You can further restrict API keys with guardrails inside a workspace.", "应用到整个账号的全局限制。你还可以在工作区内用护栏进一步限制 API 密钥。"],
    ["Data Policies", "数据策略"],
    ["Set data privacy and usage restrictions.", "设置数据隐私和使用限制。"],
    ["Zero Data Retention", "零数据保留"],
    ["ZDR endpoints guarantee your data is not stored after processing. Toggle each scope individually to enforce ZDR.", "ZDR 端点保证你的数据在处理后不会被存储。可分别切换每个范围来强制使用 ZDR。"],
    ["Only route to provider endpoints that don't store your data. Reject requests that would require data retention. Only applies to provider routing, does not apply to plugins and tools you choose to enable.", "仅路由到不存储你数据的提供商端点。需要保留数据的请求将被拒绝。此项仅适用于提供商路由，不适用于你选择启用的插件和工具。"],
    ["Non-frontier", "非前沿模型"],
    ["All non-frontier model requests will require ZDR endpoints.", "所有非前沿模型请求都将要求使用 ZDR 端点。"],
    ["First-party Anthropic endpoints will be disabled. Bedrock and Vertex will still be enabled.", "将禁用第一方 Anthropic 端点，Bedrock 和 Vertex 仍会启用。"],
    ["First-party OpenAI endpoints will be disabled. Azure will still be enabled.", "将禁用第一方 OpenAI 端点，Azure 仍会启用。"],
    ["AI Studio endpoints will be disabled. Vertex will still be enabled.", "将禁用 AI Studio 端点，Vertex 仍会启用。"],
    ["Paid endpoints that may train on request data", "可能使用请求数据训练的付费端点"],
    ["Some providers may anonymously use your data for training purposes.", "某些提供商可能会匿名使用你的数据进行训练。"],
    ["Free endpoints that may train on request data", "可能使用请求数据训练的免费端点"],
    ["Providers serving free models often retain and/or train on prompts and completions.", "提供免费模型的提供商通常会保留并/或使用提示词与补全内容进行训练。"],
    ["Free endpoints that may publish prompts", "可能公开提示词的免费端点"],
    ["Some free model providers may publish prompts and completions to public datasets.", "某些免费模型提供商可能会将提示词和补全内容发布到公共数据集。"],
    ["Allow 1% data discount in workspaces", "允许工作区使用 1% 数据折扣"],
    ["Allow workspaces to consent to OpenRouter using your inputs/outputs to improve the product. Each workspace consents separately.", "允许工作区同意 OpenRouter 使用你的输入/输出来改进产品。每个工作区需单独同意。"],
    ["Control which providers are used for routing. Leave empty to allow all.", "控制路由时可使用哪些提供商。留空表示允许全部。"],
    ["Allowed Providers", "允许的提供商"],
    ["Exclusively enable these providers for your requests.", "仅允许这些提供商处理你的请求。"],
    ["Ignored Providers", "忽略的提供商"],
    ["Exclude these providers from serving any requests.", "排除这些提供商，不让它们处理任何请求。"],
    ["Eligibility Preview", "可用性预览"],
    ["Providers and models available based on your account settings.", "根据你的账号设置可用的提供商和模型。"],
    ["Show All", "显示全部"],
    ["Click to cycle filter mode", "点击循环切换筛选模式"],
    ["Sorted by newest. Click to sort alphabetically.", "按最新排序。点击可按字母排序。"],
    ["User", "用户"],
    ["All Activity", "全部活动"],
    ["Prompts", "提示词"],
    ["Longest Streak", "最长连续天数"],
    ["This Week", "本周"],
    ["Top Models", "热门模型"],
    ["Explore", "探索"],
    ["No tokens yet", "暂无 Token"],
    ["Less", "更少"],
    ["Streak", "连续天数"],
    ["Avg Day", "日均"],
    ["Avg Week", "周均"],
    ["Credit Usage", "余额用量"],
    ["This Month", "本月"],
    ["BYOK Usage", "BYOK 用量"],
    ["Change profile picture", "更换头像"],
    ["tokens", "Token"],
    ["Manage your login credentials, security settings, or delete your account.", "管理登录凭据、安全设置，或删除账号。"],
    ["Manage", "管理"],
    ["Create and manage your organization.", "创建并管理你的组织。"],
    ["Account Type", "账号类型"],
    ["Your current account tier.", "你当前的账号等级。"],
    ["Self Serve", "自助服务"],
    ["Chatroom Color", "聊天室颜色"],
    ["Custom bubble color for this device.", "此设备上的自定义气泡颜色。"],
    ["Date Format", "日期格式"],
    ["How dates appear in logs and activity tables.", "日志和活动表格中的日期显示方式。"],
    ["Local", "本地"],
    ["UTC", "UTC"],
    ["Relative", "相对时间"],
    ["Absolute", "绝对时间"],
    ["ISO", "ISO"],
    ["Default Preset", "默认预设"],
    ["Default preset for new messages in the chatroom.", "聊天室新消息的默认预设。"],
    ["Enable analytics cookies", "启用分析 Cookie"],
    ["Allow analytics cookies to help us improve the user experience and site performance.", "允许分析 Cookie 帮助我们改进用户体验和网站性能。"],
    ["Toggle analytics cookies", "切换分析 Cookie"],
    ["Low Balance Alerts", "低余额提醒"],
    ["Emails sent to", "邮件发送至"],
    ["Toggle low balance notifications", "切换低余额通知"],
    ["Chat Completion Notifications", "聊天完成通知"],
    ["Browser notifications when chat responses complete (only when tab is not focused)", "聊天响应完成时发送浏览器通知（仅当标签页未聚焦时）"],
    ["Toggle chat completion notifications", "切换聊天完成通知"],
    ["Your chat history in the", "你的聊天历史在"],
    ["Chatroom", "聊天室"],
    ["is always stored locally on your device.", "中始终仅存储在你的设备本地。"],
    ["Explore experimental features and tools. These are works in progress and may change or be removed at any time.", "探索实验性功能和工具。这些功能仍在开发中，可能随时变更或移除。"],
    ["Experiments", "实验"],
    ["Model Fusion", "模型融合"],
    ["Run multiple models side-by-side, analyze their strengths, and fuse the best answer.", "并排运行多个模型，分析它们的优势，并融合出最佳答案。"],
    ["Spawn", "Spawn"],
    ["Deploy any AI coding agent on any cloud provider with a single command. No Terraform, no YAML — just pick an agent and a cloud.", "用一条命令在任意云服务商上部署任意 AI 编码 Agent。无需 Terraform，无需 YAML，只需选择 Agent 和云服务商。"],
    ["New Fusion", "新建融合"],
    ["No runs yet.", "还没有运行记录。"],
    ["Run multiple models side-by-side, run an analysis, and fuse into the best result.", "并排运行多个模型，执行分析，并融合成最佳结果。"],
    ["Quality", "质量"],
    ["Budget", "预算"],
    ["Fuse with", "融合方式"],
    ["Auto (first source)", "自动（第一个来源）"],
    ["Ask anything...", "询问任何内容..."],
    ["Enable Web Search", "启用网页搜索"],
    ["Refine your prompt", "优化提示词"],
    ["Run Fusion", "运行融合"],
    ["Close drawer", "关闭抽屉"],
    ["Toggle sidebar", "切换侧边栏"],
    ["New Chat", "新建聊天"],
    ["No matching rooms", "没有匹配的聊天室"],
    ["Flagship models", "旗舰模型"],
    ["Best roleplay models", "最佳角色扮演模型"],
    ["Best coding models", "最佳编码模型"],
    ["Reasoning models", "推理模型"],
    ["Car Wash Test", "洗车测试"],
    ["Should you walk or drive?", "应该步行还是开车？"],
    ["Which one is larger?", "哪个更大？"],
    ["Strawberry Test", "草莓测试"],
    ["How many r’s are in the word", "这个单词里有几个 r"],
    ["Poem Riddle", "诗歌谜题"],
    ["Compose a 12-line poem", "写一首 12 行诗"],
    ["Personal Finance", "个人理财"],
    ["Draft up a portfolio management proposal", "起草一份投资组合管理方案"],
    ["Anagram Challenge", "字母重排挑战"],
    ["Unscramble letters to form a word.", "重新排列字母组成一个单词。"],
    ["The Missing Dollar", "消失的一美元"],
    ["A classic logic puzzle involving money.", "一个关于金钱的经典逻辑谜题。"],
    ["Word Transformation", "单词变换"],
    ["Change one word into another by altering one letter at a time.", "每次改变一个字母，把一个单词变成另一个。"],
    ["Palindrome Quest", "回文挑战"],
    ["Find the smallest palindrome greater than a given number.", "找出大于给定数字的最小回文数。"],
    ["Alphabet Series", "字母序列"],
    ["Identify the next letter in a sequence.", "识别序列中的下一个字母。"],
    ["Career Development", "职业发展"],
    ["Create a professional growth roadmap.", "创建职业成长路线图。"],
    ["Healthy Lifestyle", "健康生活方式"],
    ["Design a balanced diet and exercise regimen.", "设计均衡饮食和锻炼计划。"],
    ["Small Business Strategy", "小企业战略"],
    ["Develop a business expansion plan.", "制定业务扩张计划。"],
    ["Educational Advancement", "教育提升"],
    ["Plan for higher education.", "规划高等教育。"],
    ["Create Artifact...", "创建 Artifact..."],
    ["Select artifact type", "选择 Artifact 类型"],
    ["Search rooms...", "搜索聊天室..."],
    ["Start a new message...", "开始新消息..."],
    ["Add attachment", "添加附件"],
    ["Start recording", "开始录音"],
    ["Send message", "发送消息"],
    ["Select a model", "选择模型"],
    ["AI Model Rankings", "AI 模型排行榜"],
    ["Based on benchmarks and real usage data from millions of users accessing models through OpenRouter.", "基于数百万用户通过 OpenRouter 访问模型的基准测试和真实使用数据。"],
    ["Weekly usage of models across OpenRouter", "OpenRouter 上各模型的每周用量"],
    ["LLM Leaderboard", "大语言模型排行榜"],
    ["Compare the most popular models on OpenRouter", "比较 OpenRouter 上最受欢迎的模型"],
    ["Show more", "显示更多"],
    ["Market Share", "市场份额"],
    ["Compare OpenRouter token share by model author", "按模型作者比较 OpenRouter Token 份额"],
    ["Others", "其他"],
    ["Compare models by usecase on OpenRouter", "按用例比较 OpenRouter 上的模型"],
    ["Categories", "分类"],
    ["Programming", "编程"],
    ["Languages", "语言"],
    ["Compare models by natural language on OpenRouter", "按自然语言比较 OpenRouter 上的模型"],
    ["English", "英语"],
    ["Compare models by programming language on OpenRouter", "按编程语言比较 OpenRouter 上的模型"],
    ["Context Length", "上下文长度"],
    ["Requests by prompt & completion length on OpenRouter", "按提示词和补全长度统计 OpenRouter 请求"],
    ["Tool Calls", "工具调用"],
    ["Tool usage across models on OpenRouter", "OpenRouter 上各模型的工具使用情况"],
    ["Images", "图像"],
    ["Total images processed on OpenRouter", "OpenRouter 处理的图像总数"],
    ["Audio Input", "音频输入"],
    ["Total audio prompts processed on OpenRouter", "OpenRouter 处理的音频提示词总数"],
    ["Top Apps", "热门应用"],
    ["Explore apps and agents opting into usage tracking by category", "按分类探索选择加入用量统计的应用和 Agent"],
    ["Browse the new Apps & Agents directory to explore by category, discover trending tools, and see detailed usage stats.", "浏览新的应用与 Agent 目录，按分类探索、发现趋势工具并查看详细用量统计。"],
    ["App & Agent Rankings", "应用与 Agent 排行榜"],
    ["Most Popular", "最受欢迎"],
    ["Largest public apps and agents opting into usage tracking on OpenRouter. View more →", "OpenRouter 上选择加入用量统计的最大公开应用和 Agent。查看更多 →"],
    ["Largest public apps and agents", "最大公开应用和 Agent"],
    ["opting into", "选择加入"],
    ["usage tracking on OpenRouter.", "OpenRouter 用量统计。"],
    ["View more →", "查看更多 →"],
    ["Trending", "趋势"],
    ["Fastest growing this week", "本周增长最快"],
    ["Top", "热门"],
    ["Top Coding Agents", "热门编码 Agent"],
    ["Coding Agents", "编码 Agent"],
    ["View all →", "查看全部 →"],
    ["Top Productivity", "热门效率工具"],
    ["Productivity", "效率工具"],
    ["Top Creative", "热门创意工具"],
    ["Creative", "创意工具"],
    ["Top Entertainment", "热门娱乐工具"],
    ["Entertainment", "娱乐工具"],
    ["Global Ranking", "全局排名"],
    ["Personal Agents", "个人 Agent"],
    ["CLI Agents", "CLI Agent"],
    ["IDE Extensions", "IDE 扩展"],
    ["Roleplay", "角色扮演"],
    ["Game", "游戏"],
    ["Cloud Agents", "云端 Agent"],
    ["Programming App", "编程应用"],
    ["Writing Assistants", "写作助手"],
    ["General Chat", "通用聊天"],
    ["Input Modalities", "输入模态"],
    ["Text", "文本"],
    ["Image", "图像"],
    ["File", "文件"],
    ["Audio", "音频"],
    ["Video", "视频"],
    ["Context length", "上下文长度"],
    ["Prompt pricing", "提示词定价"],
    ["Series", "系列"],
    ["Supported Parameters", "支持的参数"],
    ["Distillable", "可蒸馏"],
    ["In-Region Routing", "区域内路由"],
    ["Model Authors", "模型作者"],
    ["Inactive Models", "非活跃模型"],
    ["Compare", "比较"],
    ["Newest", "最新"],
    ["Embeddings", "嵌入"],
    ["Rerank", "重排"],
    ["Speech", "语音"],
    ["Transcription", "转录"],
    ["Filter by Text output models", "按文本输出模型筛选"],
    ["Filter by Image output models", "按图像输出模型筛选"],
    ["Filter by Embeddings output models", "按嵌入输出模型筛选"],
    ["Filter by Audio output models", "按音频输出模型筛选"],
    ["Filter by Video output models", "按视频输出模型筛选"],
    ["Filter by Rerank output models", "按重排输出模型筛选"],
    ["Filter by Speech output models", "按语音模型筛选"],
    ["Filter by Transcription output models", "按转录模型筛选"],
    ["Search models...", "搜索模型..."],
    ["Tokens processed in the last 7 days", "过去 7 天处理的 Token"],
  ]);

  const REGEX_RULES = [
    [/^API Keys \| Settings \| OpenRouter$/, "API 密钥 | 设置 | OpenRouter"],
    [/^BYOK \| Settings \| OpenRouter$/, "BYOK | 设置 | OpenRouter"],
    [/^Routing \| Settings \| OpenRouter$/, "路由 | 设置 | OpenRouter"],
    [/^Presets \| Settings \| OpenRouter$/, "预设 | 设置 | OpenRouter"],
    [/^Plugins \| Settings \| OpenRouter$/, "插件 | 设置 | OpenRouter"],
    [/^Guardrails \| OpenRouter$/, "护栏 | OpenRouter"],
    [/^Workspace Settings \| OpenRouter$/, "工作区设置 | OpenRouter"],
    [/^Privacy Settings \| OpenRouter$/, "隐私设置 | OpenRouter"],
    [/^Credits \| OpenRouter$/, "余额 | OpenRouter"],
    [/^Logs \| OpenRouter$/, "日志 | OpenRouter"],
    [/^Activity \| OpenRouter$/, "活动 | OpenRouter"],
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
    [/^(\d+)\s+models matched$/, "匹配 $1 个模型"],
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
    [/^Edit (.+)$/, "编辑 $1"],
    [/^Copy (.+)$/, "复制 $1"],
    [/^Create (.+)$/, "创建 $1"],
    [/^Add (.+)$/, "添加 $1"],
    [/^No (.+) found$/, "未找到 $1"],
    [/^Search by (.+)\.\.\.$/, "按$1搜索..."],
  ];

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  let observer = null;
  let scheduled = false;
  let started = false;

  function translate(source) {
    if (!source || !source.trim()) {
      return source;
    }

    if (isSensitive(source)) {
      return source;
    }

    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    const trimmed = source.trim();
    const exact = EXACT_TEXT.get(trimmed);
    if (exact) {
      return `${leading}${exact}${trailing}`;
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
      if (SKIP_TAGS.has(element.tagName)) {
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
    observer?.disconnect();
    try {
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
    observeRouteChanges();
    window.__openrouterWorkspacesZh = {
      run,
      translate,
      version: "0.1.2",
    };
    console.info(`[${SCRIPT_NAME}] OpenRouter Workspaces Chinese userscript bootstrapped`);
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
