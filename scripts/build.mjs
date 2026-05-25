import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const source = path.join(rootDir, "src", "openrouter-workspaces-zh.user.js");
const output = path.join(rootDir, "dist", "openrouter-workspaces-zh.user.js");

await mkdir(path.dirname(output), { recursive: true });
await copyFile(source, output);

console.log(`Built ${path.relative(rootDir, output)}`);
