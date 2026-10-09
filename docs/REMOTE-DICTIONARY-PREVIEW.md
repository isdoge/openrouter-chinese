# OpenRouter 中文化：远程词典试验版

## 合并前安装

[安装试验版 userscript](https://raw.githubusercontent.com/isdoge/openrouter-chinese/feat/remote-dictionary-preview/dist/openrouter-chinese-remote.user.js)

直链：https://raw.githubusercontent.com/isdoge/openrouter-chinese/feat/remote-dictionary-preview/dist/openrouter-chinese-remote.user.js

独立试验版与原版使用不同的 @name、@namespace 和文件名，不改动原版源码、dist、README 或 npm 脚本。

**实际测试前：请在 Tampermonkey 中暂停旧版脚本。** 两者同时在同一页面运行可能互相修改 DOM、重复监听，不能视为正确验收。旧脚本本身不会被删除。

## 行为说明

- 完整词典存放在 `locales/zh-CN.json`，从 GitHub Raw 获取。
- 首次启动先读取 Tampermonkey 中的词典缓存；首次无缓存使用少量内置保底翻译，然后异步下载完整词典。
- 成功同步后 24 小时内不重复自动请求；失败后的自动重试间隔至少 10 分钟。
- 菜单「立即更新中文词典（试验版）」可强制请求，并立即在当前页面热更新。
- 远程请求失败或数据无效时，继续使用已经缓存的有效词典。
- 词典为静态 JSON，不执行远程 JS、不调用翻译 API，不上传页面内容。
- 因为 Tampermonkey 的 GM_* 权限可能运行在隔离沙箱，保留原路由监听并增加路径变化检查。
- 正式安装后 `@downloadURL` / `@updateURL` 指向 main 下的试验版文件。合并前 main 尚不存在该文件，自动更新检查可能返回 404，不影响当前分支版脚本的手动安装和运行。

## 后续维护

1. 修改 `locales/zh-CN.json`，无需改动 JS。
2. 等待用户下次自动同步，或者使用菜单立即更新。
3. 翻译引擎 / 正则规则发生变化时，再更新 `src/openrouter-chinese-remote.user.js` 和对应的 `dist/` 文件。
4. 原版仍然按原有流程维护，直到确认试验版正常后再单独决定删除。

## 验证

运行 `node --check src/openrouter-chinese-remote.user.js`、`node --check dist/openrouter-chinese-remote.user.js` 以及 `node scripts/check-remote.mjs`。

现有 `npm test` 只检查原版，不覆盖该试验版；两套测试互不影响。
