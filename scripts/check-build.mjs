import assert from "node:assert/strict";
import { mkdtemp, mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = await mkdtemp(path.join(os.tmpdir(), "openrouter-zh-build-"));
const inputs = [
  "package.json", "release.config.json", "src/openrouter-chinese.user.js", "locales/zh-CN.json",
  "scripts/build.mjs", "scripts/dictionary-utils.mjs", "scripts/bump-dictionary.mjs",
  "scripts/check.mjs", "scripts/check-remote.mjs", "legacy/archive/src/openrouter-chinese.user.js",
];
for (const file of inputs) {
  await mkdir(path.dirname(path.join(fixture, file)), { recursive: true });
  await copyFile(path.join(root, file), path.join(fixture, file));
}
function run(script, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [script], { cwd: fixture, encoding: "utf8" });
  assert.equal(result.status, expectedStatus, `${script}\n${result.stdout}\n${result.stderr}`);
  return result;
}
const outputs = [
  "dist/openrouter-chinese.user.js", "dist/openrouter-chinese-remote.user.js",
  "legacy/openrouter-chinese.user.js", "locales/zh-CN.online.json",
];
run("scripts/build.mjs");
const first = await Promise.all(outputs.map(file => readFile(path.join(fixture, file), "utf8")));
run("scripts/build.mjs");
const second = await Promise.all(outputs.map(file => readFile(path.join(fixture, file), "utf8")));
assert.deepEqual(second, first, "重复构建必须逐字节一致");
const configPath = path.join(fixture, "release.config.json");
const before = JSON.parse(await readFile(configPath, "utf8"));
run("scripts/bump-dictionary.mjs");
assert.deepEqual(JSON.parse(await readFile(configPath, "utf8")), before, "无词典变化不递增版本");
const dictPath = path.join(fixture, "locales/zh-CN.json");
const dictionary = JSON.parse(await readFile(dictPath, "utf8"));
dictionary["Build regression phrase"] = "构建回归词条";
await writeFile(dictPath, JSON.stringify(dictionary), "utf8");
const denied = run("scripts/build.mjs", 1);
assert.match(denied.stderr, /dictionary:bump/, "词典变化未迭代版本时必须明确拒绝构建");
run("scripts/bump-dictionary.mjs");
const bumped = JSON.parse(await readFile(configPath, "utf8"));
assert.equal(bumped.dictionaryRevision, before.dictionaryRevision + 1);
const [major, minor, patch] = before.legacyVersion.split(".").map(Number);
assert.equal(bumped.legacyVersion, `${major}.${minor}.${patch + 1}`);
assert.notEqual(bumped.dictionarySha256, before.dictionarySha256);
run("scripts/build.mjs");
const envelope = JSON.parse(await readFile(path.join(fixture, "locales/zh-CN.online.json"), "utf8"));
assert.equal(envelope.revision, bumped.dictionaryRevision);
assert.equal(envelope.entries, Object.keys(dictionary).length);
assert.deepEqual(envelope.dictionary, dictionary);
run("scripts/check.mjs");
run("scripts/check-remote.mjs");
run("scripts/bump-dictionary.mjs");
assert.deepEqual(JSON.parse(await readFile(configPath, "utf8")), bumped, "相同内容重复 bump 不得增加版本");
console.log("构建回归通过：重复构建一致、未迭代阻断、词典 revision 与本地版本联动、迭代后全部测试仍通过。");
console.log("隔离构建夹具保留于：" + fixture);
