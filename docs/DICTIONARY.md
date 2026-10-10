# 词典格式、更新与维护合同

本文对应已发布的 **OpenRouter 中文化插件 1.0.0**。本次正式版完整词典为 **1731 条**，`dictionaryRevision = 2026101001`，纯本地备用版 `legacyVersion = 0.1.11`。

[返回项目说明](../README.md)｜[发布清单](../PUBLISHING.md)｜[纯本地备用版](../legacy/README.md)

## 唯一源词典与生成产物

- **`locales/zh-CN.json`** 是唯一源词典，格式为英文文案到中文译文的 plain object。
- **`src/openrouter-chinese.user.js`** 是唯一共享引擎模板，不在模板或各安装产物中分别维护词典。
- `scripts/build.mjs` 从同一源词典和模板生成：
  - `dist/openrouter-chinese.user.js`：默认正式版。
  - `dist/openrouter-chinese-remote.user.js`：保留旧在线安装链身份的兼容入口。
  - `legacy/openrouter-chinese.user.js`：纯本地备用版，`@grant none`。
  - `locales/zh-CN.online.json`：带发布元数据的在线 envelope。

各脚本都内置本次完整词典；在线 JSON 是更新数据，不是让首次运行依赖网络的唯一词典。不要手改生成文件，也不要把 envelope 当作源词典提交。

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

上例只有两条，用于解释字段，**不是本次发布快照，也不能直接导入**；本次生成文件的 `entries` 应为 `1731`，并与实际 `dictionary` 的键数一致。使用本次 revision 却配上不同内容，会被同 revision 异内容保护拒绝。

| 字段 | 含义 |
| --- | --- |
| `schemaVersion` | envelope 格式版本，本次为 `1` |
| `revision` | 词典内容版本，来自 `release.config.json.dictionaryRevision` |
| `entries` | 实际词条数量，必须与 `dictionary` 一致 |
| `dictionary` | plain object 词典数据，不是脚本或可执行规则 |

JSON 必须作为数据解析与校验，不使用 `eval` 或其他执行方式。坏 JSON、非法结构、旧 revision 或同 revision 异内容不能破坏当前可用词典；一个 revision 应对应同一份内容。

手动“导入 JSON”**只接受上述在线 envelope**，不接受 plain object。`locales/zh-CN.json` 是维护源文件，不是手动导入入口；plain object 仅用于兼容读取既有 GM 缓存，不能借此覆盖快照。导入前应先构建并选择 `locales/zh-CN.online.json`。

## 三种版本号各管什么

| 位置 | 本次值 | 维护对象 |
| --- | --- | --- |
| `package.json.version` | `1.0.0` | 默认正式脚本与兼容入口的功能／引擎版本 |
| `release.config.json.dictionaryRevision` | `2026101001` | 词典快照及在线更新的新旧比较 |
| `release.config.json.legacyVersion` | `0.1.11` | 纯本地备用脚本独立升级版本 |

`revision` 是显式维护、单调增加的内容版本，不是运行时自动生成的日期。**每次词典修改都要增加 revision 并递增 legacyVersion**，即使正式脚本只更新词典而没有新的引擎功能，也不能省略这两项。

`release.config.json.dictionarySha256` 记录源词典内容指纹，不是第四种版本号。词典实际变化后，显式运行 `npm run dictionary:bump`，递增 revision、递增备用版补丁版本并更新指纹；词典未变化时不需要运行该命令。正式脚本版本不由该命令自动提升。

构建核对指纹、revision 与词典快照的一致性；内容变化却未执行 bump 时应报错。**`build` 不得自动提升或改写版本字段**。正式版的 `1.x` 与备用版的 `0.1.x` 是两条版本记录，不应混用。

## 内置快照、缓存与部分词典

默认正式版与兼容入口以完整内置快照为兜底，再按版本处理缓存和在线数据：

1. **无缓存／无法联网**：直接使用完整内置词典，首次运行也不需要先下载在线 JSON。
2. **缓存较新**：使用较新缓存的有效词条补充／覆盖内置快照。
3. **缓存较旧**：旧缓存不得覆盖较新内置快照中的同名键。
4. **在线词典只有部分词条**：通过校验后合并，不删除其未提供的内置词条；不能把部分数据当成全量替换。
5. **更新失败或版本倒退**：保留已有可用词典与较新缓存，页面翻译和动态重翻译继续运行。

新旧比较应考虑内置快照和已有较新缓存，不能因为某个源能返回 JSON，就允许旧词典覆盖新数据。缓存提交使用原生 Web Locks 跨标签页互斥，确保读取、校验与写入期间不会被另一个标签页插入提交；发现版本冲突时继续尝试后续来源。

在线更新及手动导入需要浏览器支持 Web Locks。不支持时不执行不安全的缓存写入，仍使用完整内置快照和已有可用缓存翻译；可升级现代浏览器或使用纯本地备用版。

缓存属于相应脚本身份。`dist/openrouter-chinese-remote.user.js` 保留旧在线 namespace 与缓存身份；默认入口、旧在线身份和纯本地身份之间，**不承诺不同 namespace 自动共享缓存**。不要靠同时启用多份脚本来迁移数据。

纯本地备用版只使用生成时的内置快照，不进行在线词典同步；后续补词通过升级备用脚本获得。

## 在线源与失败回退

正式版按以下顺序尝试静态词典：

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

镜像不保证所有地区可达，固定发布快照也要在对应标签发布后才能使用。`main` 尚未合入本次变更时，不能把其旧数据或缺失文件视作已发布的 1.0.0；脚本自身的完整内置词典不受此影响。

用固定 `v1.0.0` 安装文件安装正式版，并不会将后续词典更新锁定为该标签：更新仍先尝试 `main`，固定标签仅是第三顺位快照兜底。

## 自动检查、冷却与菜单

- 启用自动更新时，启动进行检查，并每 **10 分钟**检查是否满足更新门槛；门槛未满足时不下载。
- 一次更新成功后冷却 **24 小时**；失败后冷却 **10 分钟**。
- 手动“立即更新”可强制绕过自动更新冷却，不表示可以跳过 JSON 安全校验或让旧数据覆盖较新词典。
- 停用自动更新只关闭自动同步，不影响完整内置词典与已有可用缓存的翻译。

正式版和兼容入口提供以下词典管理菜单：

| 菜单 | 用途 |
| --- | --- |
| 启用／停用自动更新 | 控制自动词典同步 |
| 立即更新 | 主动尝试在线源，可绕过冷却 |
| 查看状态 | 核对自动更新状态与更新结果 |
| 导入 JSON | 只接受在线 envelope，本地导入前校验格式／revision／内容；不执行代码、不上传内容 |

手动导入沿用旧 revision 拒绝和同 revision 异内容拒绝规则；强制更新或导入不是降低版本保护的开关。

导入和更新只影响脚本的词典数据，不修改 `locales/zh-CN.json` 仓库源文件，也不修改 OpenRouter 的账号真实数据。

## 词典维护流程

1. 确认待补的英文原文与页面位置，避免将动态账号值、敏感信息或标识符当成词条。
2. 只在 `locales/zh-CN.json` 增补或修正词条，保持 plain object；需要运行时行为变更时才修改唯一引擎模板。
3. 词典实际变化后，显式运行 `npm run dictionary:bump`，提高 `dictionaryRevision`、递增 `legacyVersion` 的补丁版本并更新 `dictionarySha256`。本次基线为 `2026101001`／`0.1.11`，后续内容变化不得继续复用该 revision。
4. 按功能／引擎变更维护正式脚本版本，再运行：

   ```sh
   npm run build
   npm test
   ```

5. 核对四个生成产物、内置快照、在线 envelope 的内容／数量／revision 和各脚本版本一致；不手改产物来掩盖不一致。
6. 按[发布清单](../PUBLISHING.md)验证无缓存离线首装、较新／较旧缓存、部分词典合并、来源失败、冷却和手动菜单。
7. 公开变更只包含词典、代码及必要产品说明，**不包含真实浏览器验收报告、用户账号信息、余额、密钥或其片段**。

词典更新只下载静态 JSON，不调用 OpenRouter API、不读取 cookie，不收集或上传 API Key、token、账号信息或页面内容；这些安全边界同样适用于手动导入。
