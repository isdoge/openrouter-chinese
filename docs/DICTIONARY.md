# 词典格式、更新与维护合同

本文对应 **OpenRouter 中文化插件**当前版本。源词典共 **2251 条**，`dictionaryRevision = 2026111302`，本地版日期版本 `26.11.13`。

[返回项目说明](../README.md)｜[本地版](../legacy/README.md)

## 唯一源词典与生成产物

- **`locales/zh-CN.json`** 是唯一源词典，格式为英文文案到中文译文的 plain object。
- **`src/openrouter-chinese.user.js`** 是唯一共享引擎模板，不在模板或各安装产物中分别维护词典。
- `scripts/build.mjs` 从同一源词典和模板生成：
  - `dist/openrouter-chinese.user.js`：在线版，词典外置。
  - `dist/openrouter-chinese-remote.user.js`：保留旧在线安装链身份的兼容入口。
  - `legacy/openrouter-chinese.user.js`：本地版，内置完整词典快照，`@grant none`。
  - `locales/zh-CN.online.json`：带发布元数据的在线词典 envelope。

在线版**不内置词典**，启动时从在线源拉取一次并缓存；本地版**只使用内置快照**。不要手改生成文件，也不要把 envelope 当作源词典提交。

## JSON 格式

### 源词典：plain object

`locales/zh-CN.json` 顶层只放词条，不放 `schemaVersion`、`revision`、`entries` 或 `dictionary` 包装字段。示例仅说明格式，不是完整发布词典：

```json
{
  "Save": "保存",
  "Cancel": "取消"
}
```

维护时使用准确的原文与字符串译文，避免重复键；不要加入模型 ID、邮箱、URL、密钥、真实账号数据或执行代码的内容。

### 在线词典：envelope

`locales/zh-CN.online.json` 由构建生成，结构为：

```json
{
  "schemaVersion": 1,
  "revision": 2026101001,
  "entries": 2,
  "dictionary": {
    "Save": "保存",
    "Cancel": "取消"
  }
}
```

上例只有两条，用于解释字段，**不是本次发布快照**；生成文件的 `entries` 应与实际 `dictionary` 的键数一致（当前 `2251`）。使用本次 revision 却配上不同内容，会被同 revision 异内容保护拒绝。

| 字段 | 含义 |
| --- | --- |
| `schemaVersion` | envelope 格式版本，本次为 `1` |
| `revision` | 词典内容版本，来自 `release.config.json.dictionaryRevision` |
| `entries` | 实际词条数量，必须与 `dictionary` 一致 |
| `dictionary` | plain object 词典数据，不是脚本或可执行规则 |

JSON 必须作为数据解析与校验，不使用 `eval` 或其他执行方式。坏 JSON、非法结构、旧 revision 或同 revision 异内容不能破坏当前可用词典；一个 revision 应对应同一份内容。

脚本不提供"导入 JSON"功能；词典只通过在线源更新。

## 两种版本号各管什么

| 位置 | 本次值 | 维护对象 |
| --- | --- | --- |
| `package.json.version` | `1.0.4` | 在线版脚本的功能／引擎版本；**只在脚本源码变化时递增** |
| `release.config.json.dictionaryRevision` | `2026111302` | 词典内容版本，单调递增；本地版日期版本由它派生（如 `2026111302` → `26.11.13`） |

`release.config.json.dictionarySha256` 记录源词典内容指纹，不是第三种版本号。词典实际变化后，显式运行 `npm run dictionary:bump`，递增 revision 并更新指纹；词典未变化时不需要运行该命令。**`build` 不得自动提升或改写版本字段**；词典变化却未执行 bump 时应报错。

在线版的 `1.x` 数字版本与本地版的日期版本是两条记录，不应混用。

## 在线版的词典生命周期

在线版启动时按来源顺序拉取一次词典（无定时器、无自动轮询）：

1. **缓存优先**：有有效缓存时先应用缓存，再按 revision 决定是否采用在线数据。
2. **在线拉取**：请求失败、超时、坏 JSON、非法数据或旧 revision 都不破坏当前可用词典。
3. **手动更新**：脚本菜单「立即更新中文词典」主动尝试在线源；无自动更新功能，更新完全由用户手动触发。
4. **查看状态**：菜单「查看词典状态」显示脚本版本、词典 revision、来源与条数。

缓存提交使用原生 Web Locks 跨标签页互斥，确保读取、校验与写入期间不会被另一个标签页插入提交；发现版本冲突时继续尝试后续来源。不支持 Web Locks 的浏览器不执行不安全的缓存写入，仍使用已加载词典翻译。

缓存属于相应脚本身份。`dist/openrouter-chinese-remote.user.js` 保留旧在线 namespace 与缓存身份；在线身份和本地身份之间，**不承诺不同 namespace 自动共享缓存**。不要靠同时启用多份脚本来迁移数据。

本地版只使用生成时的内置快照，不进行在线词典同步；后续补词通过安装按新日期版本构建的本地版脚本获得。

## 在线源与失败回退

在线版按以下顺序尝试静态词典：

1. GitHub raw 的 `main`：

   ```text
   https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/locales/zh-CN.online.json
   ```

2. jsDelivr 的 `main` 镜像：

   ```text
   https://cdn.jsdelivr.net/gh/isdoge/openrouter-chinese@main/locales/zh-CN.online.json
   ```

3. GitHub raw 的 `v1.0.0` 发布快照：

   ```text
   https://raw.githubusercontent.com/isdoge/openrouter-chinese/v1.0.0/locales/zh-CN.online.json
   ```

请求失败、超时、坏 JSON、非法数据或旧 revision 都应继续尝试备用源。全部来源不可用时，不中断翻译，也不清空已有可用词典。

镜像不保证所有地区可达，固定发布快照也要在对应标签发布后才能使用。`main` 尚未合入本次变更时，不能把其旧数据或缺失文件视作已发布内容。

## 词典菜单

在线版和兼容入口提供以下词典管理菜单（无自动更新、无导入）：

| 菜单 | 用途 |
| --- | --- |
| 立即更新中文词典 | 用户手动触发在线源拉取，可越过启动周期，不跳过 JSON 安全校验 |
| 查看词典状态 | 核对脚本版本、词典 revision、来源与条数 |

更新不是降低版本保护的开关：旧 revision 拒绝和同 revision 异内容拒绝规则始终生效。更新只影响脚本的词典数据，不修改 `locales/zh-CN.json` 仓库源文件，也不修改 OpenRouter 的账号真实数据。

## 词典维护流程

1. 确认待补的英文原文与页面位置，避免将动态账号值、敏感信息或标识符当成词条。
2. 只在 `locales/zh-CN.json` 增补或修正词条，保持 plain object；需要运行时行为变更时才修改唯一引擎模板。
3. 词典实际变化后，显式运行 `npm run dictionary:bump`，提高 `dictionaryRevision` 并更新 `dictionarySha256`。本次基线为 `2026111302`，后续内容变化不得继续复用该 revision。
4. 脚本源码有功能／引擎变化时，递增 `package.json.version`（在线版），再运行：

   ```sh
   npm run build
   npm test
   ```

5. 核对生成产物、本地版内置快照、在线 envelope 的内容／数量／revision 和各脚本版本一致；不手改产物来掩盖不一致。
6. 公开变更只包含词典、代码及必要产品说明，**不包含真实浏览器验收报告、用户账号信息、余额、密钥或其片段**。

词典更新只下载静态 JSON，不调用 OpenRouter API、不读取 cookie，不收集或上传 API Key、token、账号信息或页面内容。
