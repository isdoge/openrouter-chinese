# 纯本地备用版与历史归档

默认产品是 **OpenRouter 中文化插件 1.0.0**：内置完整词典＋缓存＋多源在线更新。新用户请先阅读[主 README](../README.md#安装)；本目录保留纯本地路线作为备用，不是第二个推荐安装的“在线版”。

> 默认正式版 `v1.0.0` 已发布。以下固定标签地址对应正式发布资产；纯本地版仍是备用路线。

## 当前纯本地备用版

- 生成文件：`legacy/openrouter-chinese.user.js`。
- 独立版本：`0.1.11`，对应词典 revision `2026101001`。
- 内置与默认正式版相同的完整 1731 条词典；没有在线词典也能完成翻译。
- 使用 `@grant none`，翻译运行时不请求在线词典，不提供自动更新、立即更新、状态查看或 JSON 导入等词典更新管理菜单。
- 沿用原本地版的显示名和 namespace，保留原本地身份，不额外改名成新产品。

“纯本地”描述的是翻译与词典运行方式；安装文件下载和用户脚本管理器自身的脚本升级仍是另外的动作。OpenRouter 网站也仍按网站自身要求联网。

## 安装与切换

纯本地备用版的固定标签入口：

```text
https://raw.githubusercontent.com/isdoge/openrouter-chinese/v1.0.0/legacy/openrouter-chinese.user.js
```

与默认正式版二选一：

1. 切换前先停用当前脚本，核对管理器中的脚本身份及安装提示。
2. 安装所选入口，刷新页面确认翻译。
3. 如果管理器允许多个入口并存，**只启用一份**，不要让正式版、备用版与旧历史脚本同时处理页面。

默认正式版的主安装地址是 GitHub Release 资产，不是本目录的文件：

```text
https://github.com/isdoge/openrouter-chinese/releases/download/v1.0.0/openrouter-chinese.user.js
```

原在线版用户应按[主 README 的兼容入口说明](../README.md#本地与在线有什么区别)处理旧身份。兼容入口保留旧在线 namespace 与缓存，不承诺与本地身份或其他 namespace 自动共享缓存。

## 维护规则

`legacy/openrouter-chinese.user.js` 是生成产物，不应手工改词典或维护第二份引擎。

- 唯一共享引擎模板：`src/openrouter-chinese.user.js`。
- 唯一源词典：`locales/zh-CN.json`，plain object。
- 每次词典实际修改后，显式运行 `npm run dictionary:bump`：增加 `dictionaryRevision`、递增 `legacyVersion` 的补丁版本，并更新 `dictionarySha256`；本次备用版为 `0.1.11`。
- 正式脚本版本在 `package.json.version` 维护，不应因为备用版仍用 `0.1.x` 就将主版降回旧版本号。
- 再运行 `npm run build` 统一生成，执行 `npm test` 核对；`build` 不自动改版本／revision，词典变化但未 bump 时应报错。

详细格式、缓存规则与词典迭代流程见 [DICTIONARY.md](../docs/DICTIONARY.md)。

## 历史存档

`legacy/archive/` 用于冻结原本地版 `0.1.10` 和旧在线 `beta.5` 的历史文件：

```text
archive/
├── src/        # 旧源码
├── dist/       # 旧生成产物
├── docs/       # 旧词典预览说明等非私密历史文档
└── scripts/    # 旧浏览器脚本等历史工具
```

旧预览说明只供了解历史方案，不作为当前接口合同。上述归档目录不是继续维护的备用安装入口。

这些历史文件不是当前安装推荐，不承诺覆盖最新页面或具有正式版能力。本轮先保留，后续是否清理另行决定，不在本次发布中删除。

当前备用版是本目录顶层的生成文件，历史档是 `archive/` 下的旧文件，请勿混淆。公开归档也不得包含真实浏览器验收报告、账号信息或秘密；归档不是将私密记录公开的理由。
