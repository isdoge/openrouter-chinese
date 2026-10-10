# OpenRouter 中文化插件（远程词典试验版）真实浏览器验收报告

- 验收日期：2026-10-10
- 仓库：https://github.com/isdoge/openrouter-chinese
- 修复分支：`fix/remote-acceptance-gaps` → PR #5（https://github.com/isdoge/openrouter-chinese/pull/5，未合并）
- 验收人：Claude（mac 设备）

---

## 一、测试环境

| 项目 | 值 |
|---|---|
| 浏览器 | **ego lite 0.5.1.13（Chromium 152.0.7977.54）**，任务空间隔离上下文 |
| Tampermonkey | **v5.5.0**（篡改猴，Profile 2，真实扩展） |
| 操作系统 | macOS（Darwin 27.2.0） |
| 被测脚本 | OpenRouter 中文化插件（远程词典试验版）**0.2.0-beta.3**（验收前为 main 上的 0.2.0-beta.2） |
| 远程词典 | `locales/zh-CN.json`（main 分支，1274 条；修复后 1396 条） |
| OpenRouter | 真实站点 + **真实登录态**（用户本人在验收窗口完成登录） |
| 自动化方式 | ego-browser（ego lite）任务空间 + CDP（Runtime.evaluate / Page.reload / snapshotText 等） |

**与任务书的两点偏差（如实说明）**：

1. 任务书要求「真实安装的 Chrome 或 Edge」。用户在本轮中明确要求使用 `/ego-browser`（ego lite）并已在其内完成 OpenRouter 登录，故浏览器采用 **ego lite**（完整 Chromium 内核 + 真实 Tampermonkey 扩展 + 真实登录态）。Chrome/Edge 路线未采用。
2. Playwright 及 `scripts/check-remote-browser.mjs` 未使用（用户明确禁用 Playwright；且该脚本依赖未安装）。

---

## 二、测试结果总表

| 项目 | 结果 | 说明 |
|---|---|---|
| 脚本安装 | **PASS** | 经真实 TM 安装页从 raw 地址安装（名称/版本/作者/@match 均正确）；后续经 TM 更新流程升级 beta.2 → beta.3 |
| GM 权限授予 | **PASS** | GM_xmlhttpRequest 成功拉取 raw.githubusercontent.com；GM_getValue/setValue 落盘可见；GM_registerMenuCommand 随 bootstrap 成功执行（见「未验证项」） |
| 远程词典加载 | **PASS** | 词典独有条目生效（如 Hero 区「每个模型的统一接口」仅存在于远程词典）；TM 存储中可见词典缓存与时间戳 |
| GM 缓存写入 | **PASS** | leveldb（chrome.storage.local）中按脚本 UUID 存有 `openrouter-zh-remote-dictionary-v1`、`last-success-v1`、`last-attempt-v1`，成功时间戳为当日 |
| 24h 冷却 | **PASS** | 重载页面后 last-attempt 时间戳不变，未发起重复请求；缓存优先 |
| 手动更新（菜单） | **NOT TESTED** | 「立即更新中文词典（试验版）」已注册（bootstrap 完成即证明调用未抛错），但浏览器工具栏 UI 无法通过页面级 CDP 点击，未做真实点击 |
| 失败回退（断网/坏 JSON） | **NOT TESTED（真实浏览器）** | GM 请求走扩展后台，页面级 Network 屏蔽/拦截无效；本场景由 `scripts/check-remote.mjs` 单测覆盖（坏 JSON、HTTP 503、404 回退分支均有断言） |
| 新词典条目浏览器内应用 | **PARTIAL** | 122 条新词条经单测验证 + 全部字符串自真实页面采集；因 GM 24h 冷却与 TM 安装拦截状态，未能在本机会话内换入新词典实机渲染（合并后经菜单立即更新即可生效） |
| SPA 路由 | **PASS** | 点击站内导航（模型→排行榜）、history 后退/前进均正常切换且保持中文，无回退卡死 |
| 动态 DOM | **PASS** | MutationObserver 对新插入节点实时翻译（注入测试节点即时变中文）；下拉菜单、搜索弹窗正常 |
| 敏感文本保护 | **PASS** | API Keys 页 `sk-or-v1-ce2...fe3` 原样未动；模型 ID、Provider 名、URL、邮箱规则不翻 |
| 页面性能 | **PASS** | 路由切换翻译延迟 ~104ms；观察窗口内 long task = 0；静态页无变动风暴 |
| 原版脚本 | **PASS** | 0.1.10 已禁用（未删除、缓存未动），`npm test` 通过，原版可独立安装使用 |

---

## 三、Bug 清单

### BUG-1（已修复）：英文值规范化条目把翻译节点冻死

- **问题描述**：Rankings 页「热门模型/热门应用」统计单位恒显示英文 `Token`（共 10 处），而词典中 `"Token" → "令牌"` 存在且其他位置的 `Token` 翻译正常。
- **复现位置**：`https://openrouter.ai/rankings`，`<span class="ml-1">Token</span>`（父级为统计卡 `div`）。
- **根因分析**：站点先把单元渲染为小写 `tokens`，词典中存在规范化条目 `"tokens" → "Token"`（英文值），脚本据此把节点文本改成 `Token`，同时 `originalText` 状态记录的**源文本仍是 `tokens`**。此后每轮翻译都从陈旧源文本推导：`translate("tokens") = "Token"`，与节点当前文本相同，于是永远判定「已翻译」，`"Token" → "令牌"` 这条译项永远无法在该节点生效。（注入全新 `Token` 节点可正常翻译，可据此区分。）
- **归属**：脚本逻辑（状态机缺陷），非词典数据或浏览器兼容问题。
- **修复方式**：`getOriginalText` / `getOriginalAttr` 增加规则——当当前文本与记录的译文相同、但当前文本本身是**纯 ASCII 英文且可译**时，按当前文本重新派生源文本。恒等映射条目（`GitHub → GitHub` 等 14 条）不触发刷新；唯一链式条目 `CLI Agents → CLI Agent → CLI 代理` 正是期望行为，无链式风险。
- **复测结果**：**PASS（真实浏览器）**。安装 beta.3 后重载 Rankings 页，10 处 `Token` 全部变为 `令牌`（修复前恒为英文）。
- **回归测试**：`scripts/check-remote.mjs` 新增「规范化冻死」场景（含稳定性断言：不得在 `Token`/`令牌` 间反复横跳）。

### 词典矛盾条目（已修复）

- **问题描述**：`"tokens" → "Token"` 与 `"Token" → "令牌"` 并存，前者是 BUG-1 的触发条件，且统计单位按产品术语应显示「令牌」。
- **修复方式**：`"tokens"` 改为 `"令牌"`；`check-remote.mjs` 的迁移断言由 deepEqual 改为「超集 + 记录在案的覆盖」（`DOCUMENTED_OVERRIDES`），原版 1279 条内置译项逐一保持原值。

---

## 四、修复结果

| 项目 | 值 |
|---|---|
| 新分支 | `fix/remote-acceptance-gaps`（基于 main，未直推 main） |
| Commit | `0c299fb` 修复主体 → `204e474` 末批词条 → `64e12ac` 测试计数（另含一次误提交及其 revert，见下） |
| PR | https://github.com/isdoge/openrouter-chinese/pull/5（**未合并**） |
| 修改文件 | `src/openrouter-chinese-remote.user.js`、`dist/openrouter-chinese-remote.user.js`（版本 0.2.0-beta.2 → **0.2.0-beta.3**）、`locales/zh-CN.json`（1274 → **1396** 条）、`scripts/check-remote.mjs` |
| 自动化测试 | `node scripts/check-remote.mjs` ✅ 通过（1396 条、迁移、回退、缓存、冷却、热更新、标题、坏 JSON、HTTP 失败、冻死修复、新正则）；`npm test`（原版）✅ 不受影响 |
| 未能运行 | `scripts/check-remote-browser.mjs`（仓库未安装 Playwright，既有环境限制） |

**说明**：验收过程中曾误将临时验证文件提交到 PR 分支，已用 revert 撤回（净 diff 干净，历史中可见提交+revert 一对）。如希望历史完全整洁，可在合并前 force-push 整理（需用户确认后执行）。

**词典增补范围**（122 条）：全局导航/横幅/页脚、aria-label/title/placeholder、Rankings（含图表 a11y 摘要）、Chat、Fusion、工作区 12 个子页（Keys/Files/Guardrails/BYOK/Routing/Tools/Settings/Observability 等）、Logs、Labs、Benchmarks、搜索弹窗与账号菜单。新增正则：`37.6T Token/tokens`、`Tools: N active`、`Show N more`、`Key limit: N% used of unlimited`。

**专有名词处理**（按用户要求保留英文）：模型名、Provider 名、工具 ID（`openrouter:shell` 等）、Shell/Bash、ElevenLabs/OpenRouter/Webhook/CLI/BYOK/TypeSafe Jev、Ori、ID、URL、日期与统计数字、API Key。

---

## 五、漏翻残留（未计入本次修复，需产品判断）

- 博客文章标题与正文、Apps 页各应用的产品简介（属内容而非界面文案）
- `Ori`、`ID`、`GMT+8`、`1d`、`K`/`J`（快捷键提示）、`X`（品牌）
- Provider/工具名称表（BYOK 63 家、Observability 20 家）为专有名词，保留
- 少量语义存疑未收录：`Domain`（已收）、`Artifacts`（已收）、`runs`（未能定位上下文）

---

## 六、最终结论

1. **已真实验证通过**：真实 Tampermonkey 安装/更新、GM 权限与远程词典加载、GM 缓存读写、24h 冷却、SPA 路由与动态 DOM、敏感文本保护、页面性能、原版独立性；BUG-1 修复在真实浏览器复测通过。
2. **发现并修复的问题**：BUG-1（规范化冻死，含根因分析与回归测试）+ 词典矛盾条目；另收集并修复 122 条漏翻。
3. **尚未验证/有风险**：
   - 手动更新菜单的**真实点击**（浏览器 UI 不可页面级自动化；注册已间接证实）
   - 断网/坏 JSON 的**真实浏览器**回退（仅单测覆盖）
   - 新词典条目的**实机渲染**（受 24h 冷却限制；合并后需在 TM 菜单点「立即更新中文词典（试验版）」或等待 24 小时）
   - TM 5.5 面板的脚本编辑器无法通过自动化可靠保存（影响中途换词典地址的验证手段，非产品缺陷）
4. **是否建议继续使用试验版**：建议继续试用。核心机制（远程加载/缓存/冷却/热更新/SPA）在真实浏览器全部正常，且已好于原版（原版同样携带 `tokens → Token` 矛盾条目）。
5. **是否具备替代原版的条件**：合并本 PR 并观察一个完整使用周期（含一次手动更新）后，即可考虑替代；原版在替代前保持可安装状态。

---

## 七、当前浏览器状态（验收后）

- ego lite 任务空间 `openrouter 试验版验收`（id 21）保持打开，内含用户 OpenRouter 登录态
- Tampermonkey：试验版 **0.2.0-beta.3 已启用**（词典地址为 main，缓存为 main 旧词典）；原版 0.1.10 **已禁用未删除**
- 合并 PR #5 后：在该窗口 TM 菜单执行「立即更新中文词典（试验版）」即可获得 1396 条新词典
