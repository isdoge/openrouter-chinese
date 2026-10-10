# 发布指南

本文记录 **OpenRouter 中文化插件 1.0.0 的发布规范与清单**。本次发布已按清单完成代码、构建、回归和真实油猴安装核对；清单仍供后续版本维护者逐项复用。

## 发布身份与版本

默认正式版的显示名为 **OpenRouter 中文化插件**，不附加“在线版”或“试验版”。默认入口内置完整词典，提供缓存、多源在线更新和管理菜单；纯本地路线保留在 `legacy/` 备用。

| 字段／产物 | 本次目标 |
| --- | --- |
| `package.json.version` | `1.0.0`，默认正式版与旧在线兼容入口的脚本版本 |
| `release.config.json.dictionaryRevision` | `2026101001` |
| `release.config.json.legacyVersion` | `0.1.11`，纯本地备用版独立版本 |
| `release.config.json.dictionarySha256` | 与当前源词典内容一致的 SHA-256 指纹，由显式词典迭代命令维护 |
| `locales/zh-CN.json` | 唯一源词典，plain object，完整 1731 条 |
| `locales/zh-CN.online.json` | `{schemaVersion: 1, revision, entries, dictionary}`，本次 `entries` 为 `1731` |
| 发布标签 | `v1.0.0` |

词典每次变化都必须显式运行 `npm run dictionary:bump`，递增 `dictionaryRevision`、递增 `legacyVersion` 的补丁版本并更新 `dictionarySha256`；正式脚本版本按功能／引擎变更显式维护。构建应校验指纹、revision 与词典快照一致，**`build` 不得自动修改版本或 revision 来“修好”不一致**。

## 一、源码与产物一致性

- [ ] `src/openrouter-chinese.user.js` 是唯一共享引擎模板，完整词典只在 `locales/zh-CN.json` 维护。
- [ ] 源词典词条数、配置指纹／revision、内置快照和在线 envelope 的 revision／entries 一致；词典变化但未执行 `dictionary:bump` 时应阻止构建。
- [ ] 构建从同一引擎与词典生成以下四个产物，没有手工修改生成文件：
  - `dist/openrouter-chinese.user.js`：默认正式版，`1.0.0`。
  - `dist/openrouter-chinese-remote.user.js`：旧在线安装链兼容入口，`1.0.0`，显示名仍无后缀。
  - `legacy/openrouter-chinese.user.js`：当前纯本地备用版，`0.1.11`，`@grant none`。
  - `locales/zh-CN.online.json`：本次完整在线发布快照。
- [ ] 默认版、兼容入口和备用版都内置本次完整 1731 条词典；纯本地备用版不在翻译运行时请求在线词典，也不提供在线更新管理菜单。
- [ ] 兼容入口保持旧在线版 namespace 和缓存身份；备用版保持原本地版的显示名与 namespace。不承诺不同 namespace 自动共享缓存。
- [ ] 主版 `@updateURL`／`@downloadURL` 保留 `main/dist/openrouter-chinese.user.js`；未合入 `main` 前不把该地址宣传成本次正式版安装入口。
- [ ] 原本地版 `0.1.10` 和旧在线 `beta.5` 在 `legacy/archive/src/`、`legacy/archive/dist/` 冻结保留；旧预览说明与旧浏览器工具分别归入 `archive/docs/`、`archive/scripts/`。这些不是继续维护的备用安装入口，本轮不删除历史档。
- [ ] README、词典文档、legacy 说明与用户可理解的 CHANGELOG 使用同一合同，未出现虚构的 GreasyFork 发布链接。

## 二、构建与仓库校验

词典实际变化时先显式执行 `npm run dictionary:bump`，然后在待发布工作区执行构建与校验，核对命令结果及生成差异。词典未变化时不要为发布再次 bump：

```sh
npm run build
npm test
```

- [ ] 两条命令成功，语法、词典和仓库校验无未处理问题。
- [ ] 构建前后版本／revision 配置未被自动改写；配置与快照不一致时失败，而不是静默提升版本。
- [ ] 重复构建结果一致；四个产物来自同一待发布提交。
- [ ] 没有将临时文件、调试脚本、私密验收记录或用户数据混入待公开变更。

## 三、翻译、离线首装与更新验收

验收只检查界面显示和脚本自己的词典状态。涉及账号页面时，使用有权限的现有会话，**不得提交保存、创建、删除、重生成、付款、API Key 或权限变更操作**。不要为了验收读取或记录秘密。

### 内置兜底与完整离线首装

- [ ] 先取得安装文件，再在**没有词典缓存**的安装状态下阻断全部在线词典源，确认首次运行无需下载 JSON，也能使用完整内置 1731 条词典。
- [ ] 对首页、工作区、模型／排行榜、设置等代表性页面，以及菜单、浮层、模态框和动态渲染内容检查翻译；在线词典失败不影响重翻译。
- [ ] 纯本地备用版也使用相同完整快照，运行时没有在线词典请求。
- [ ] 模型 ID、URL、邮箱、API Key 等敏感或标识内容未被误改，账号真实数据没有变更。

这里的“离线”指词典源不可达，不是要求 OpenRouter 网站本身可以离线加载。

### 缓存与合并

- [ ] 较新缓存可优先补充／覆盖内置快照，无网络时仍可用。
- [ ] 旧缓存不得覆盖较新内置快照中的同名键。
- [ ] 远程只提供部分词条时，合并后仍保留其未提供的内置词条，不将远程部分词典当作全量替换。
- [ ] 更新失败、无效 JSON 或旧 revision 不破坏已有可用词典与较新缓存。
- [ ] 旧在线兼容入口沿用旧 namespace 的缓存；跨 namespace 的迁移未被描述为自动共享。

### 多源故障回退

- [ ] 顺序为 `raw main → jsDelivr main → raw v1.0.0 发布快照`，完整地址见 [DICTIONARY.md](docs/DICTIONARY.md#在线源与失败回退)。
- [ ] 分别模拟请求失败、超时、坏 JSON／不合法结构及旧 revision，确认都会尝试下一个备用源。
- [ ] 前两个源失败时可尝试固定发布快照；全部来源不可用时继续使用内置／已有可用词典，不中断翻译。
- [ ] JSON 只按数据校验与解析，不执行代码；更新只访问静态词典源，不调用 OpenRouter API、不读取 cookie，不收集或上传 key、token、账号信息或页面内容。

### 自动同步与菜单

- [ ] 启动检查与每 10 分钟的检查门槛生效；成功后 24 小时、失败后 10 分钟冷却，不把门槛检查误当作每次都发网络请求。
- [ ] 手动“立即更新”可强制绕过冷却；停用自动更新后不再自动请求，但内置／缓存翻译仍正常。
- [ ] 启用自动更新、停用自动更新、立即更新、查看状态、导入 JSON 菜单均可用，状态反馈与实际更新结果一致。
- [ ] 手动导入只接受 `zh-CN.online.json` 格式的在线 envelope；合法数据可导入，plain object、坏 JSON、非法结构、旧 revision 和同 revision 异内容应被拒绝，不破坏现有词典、不执行代码或上传内容。plain object 仅兼容读取既有 GM 缓存。
- [ ] 切换正式版与纯本地备用版时只启用一份脚本；管理器允许并存时也不重复处理页面。

## 四、公开内容安全检查

**真实浏览器验收报告和用户账号信息禁止进入公开仓库、PR 或 Release。** 证据私下保管，不能因“需要证明验收”而附上原始报告。

- [ ] 待公开的文件、提交差异、PR 正文／评论、Release 正文和附件均不含验收报告、原始浏览器日志或快照。
- [ ] 不含账号标识、真实用量／余额、登录态、cookie、token、API Key／管理密钥及其片段；不使用真实账号数据作为示例。
- [ ] 保留的公开截图已经过隐私核对；新增图片不得泄露用户信息。
- [ ] CHANGELOG 仅列用户可理解的产品变更，不粘贴验收记录或真实账号页面的日期／数据。

发现私密内容时停止发布，先按授权隔离并复核，不直接把原始报告搬入公开历史归档。

## 五、发布操作与安装入口

以下由有发布权限的维护者在清单通过后执行；本文不表示这些外部操作已经发生。

- [ ] 核对待发布提交、标签和四个构建产物；显式执行获批的合并／发布操作。
- [ ] 创建指向已核验提交的 `v1.0.0` 标签和 Release，将 `dist/openrouter-chinese.user.js` 以 **`openrouter-chinese.user.js`** 文件名上传为主安装资产。
- [ ] 核对 Release 资产与该标签的 `dist` 主版内容一致，并验证固定标签的备用安装入口和词典快照可用；镜像地址不承诺所有地区可达。
- [ ] 发布说明只包含产品变更、安装入口和版本边界；本轮不在 GreasyFork 发布。
- [ ] `main` 合入本轮变更后，才核对并宣布 `main` 脚本升级链可用。否则保留固定标签安装指引，不把旧 `main` 当作 1.0.0。
- [ ] 只有实际发布完成后，才更新 README 等文档中的“待发布”提示。

主安装地址：

```text
https://github.com/isdoge/openrouter-chinese/releases/download/v1.0.0/openrouter-chinese.user.js
```

固定标签备用地址：

```text
https://raw.githubusercontent.com/isdoge/openrouter-chinese/v1.0.0/dist/openrouter-chinese.user.js
https://cdn.jsdelivr.net/gh/isdoge/openrouter-chinese@v1.0.0/dist/openrouter-chinese.user.js
```

纯本地备用版地址：

```text
https://raw.githubusercontent.com/isdoge/openrouter-chinese/v1.0.0/legacy/openrouter-chinese.user.js
```

旧在线安装链兼容入口：

```text
https://raw.githubusercontent.com/isdoge/openrouter-chinese/v1.0.0/dist/openrouter-chinese-remote.user.js
```

这些入口不是让用户同时安装并启用多份脚本；选择与现有身份匹配的一份即可。
