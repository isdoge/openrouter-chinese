import { createHash } from "node:crypto";

export function dictionaryHash(dictionary) {
  const entries = Object.entries(dictionary).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return createHash("sha256").update(JSON.stringify(Object.fromEntries(entries))).digest("hex");
}

export function validateDictionary(dictionary) {
  if (!dictionary || typeof dictionary !== "object" || Array.isArray(dictionary)) {
    throw new Error("词典必须为 JSON 对象");
  }
  const entries = Object.entries(dictionary);
  if (entries.length < 20 || entries.length > 5000) throw new Error("词典条数超出范围");
  for (const [key, value] of entries) {
    if (!key.trim() || key.length > 4000 || typeof value !== "string" || !value.trim()
        || value.length > 8000 || ["__proto__", "prototype", "constructor"].includes(key)) {
      throw new Error("词典中存在无效条目");
    }
  }
  if (Buffer.byteLength(JSON.stringify(dictionary), "utf8") > 800_000) {
    throw new Error("词典超出 800000 字节限制");
  }
  return entries.length;
}

export function validateReleaseConfig(config) {
  if (!Number.isSafeInteger(config.dictionaryRevision) || config.dictionaryRevision < 1
      || !/^\d+\.\d+\.\d+$/.test(config.legacyVersion)
      || !/^[a-f0-9]{64}$/.test(config.dictionarySha256)) {
    throw new Error("release.config.json 的词典版本、本地版本或指纹无效");
  }
}
