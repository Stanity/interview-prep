import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 容器语法 lint：检查 :::qa / :::card 的结构问题。
// 三类错误在渲染时都会静默出错（不报异常），只会悄悄少渲染或错位：
//   1. 嵌套容器 —— containerRule 不支持嵌套，内层开启标记会被当成正文
//   2. 未闭合 —— 会一直吞到下一个 :::
//   3. 孤立闭合 —— 渲染成普通段落

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".github", "tools", ".reasonix"]);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, acc);
    } else if (entry.isFile() && /\.md$/i.test(entry.name) && entry.name.toLowerCase() !== "readme.md") {
      acc.push(full);
    }
  }
  return acc;
}

const OPEN_RE = /^:::(qa|card)\b/;
let problems = 0;

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const stack = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith("```")) { inFence = !inFence; continue; }
    if (inFence) continue;

    if (OPEN_RE.test(t)) {
      if (stack.length) {
        console.log(rel + ":" + (i + 1) + "  嵌套容器（外层开启于第 " + stack[stack.length - 1] + " 行，需先补 :::）");
        problems++;
      }
      stack.push(i + 1);
    } else if (t === ":::") {
      if (!stack.length) {
        console.log(rel + ":" + (i + 1) + "  孤立闭合标记（没有对应的开启）");
        problems++;
      } else {
        stack.pop();
      }
    }
  }

  if (stack.length) {
    console.log(rel + "  未闭合容器：第 " + stack.join(", ") + " 行");
    problems++;
  }
}

if (problems) {
  console.log("\n✖ 发现 " + problems + " 处容器结构问题");
  process.exit(1);
}
console.log("✔ 容器结构全部合法（无嵌套 / 无未闭合 / 无孤立闭合）");
