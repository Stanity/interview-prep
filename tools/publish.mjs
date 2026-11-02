import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (args) => execFileSync('git', args, { cwd: ROOT, stdio: 'inherit' });

// 1) 构建 dist/
execFileSync('node', ['tools/build.mjs'], { cwd: ROOT, stdio: 'inherit' });

// 2) 暂存
git(['add', '-A']);

// 3) 是否有内容变更
let dirty = true;
try {
  execFileSync('git', ['diff', '--cached', '--quiet'], { cwd: ROOT, stdio: 'ignore' });
  dirty = false;
} catch {
  dirty = true;
}

if (!dirty) {
  console.log('没有内容变更，跳过提交。');
  process.exit(0);
}

const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
const msg = process.argv[2] || `docs: 更新面试资料 ${stamp}`;
git(['commit', '-q', '-m', msg]);
git(['push', '-q', 'origin', 'main']);
console.log('\n✔ 已推送。GitHub Pages 将在 1–2 分钟后自动更新。');
