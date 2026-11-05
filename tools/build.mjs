import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDoc, esc } from './md.mjs';
import { page } from './ui.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, process.env.OUT_DIR ? process.env.OUT_DIR : 'dist');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.github', 'tools', '.reasonix']);
const SKIP_FILES = new Set(['readme.md']);

/* ---------- 收集 markdown ---------- */
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, acc);
    } else if (entry.isFile() && /\.md$/i.test(entry.name) && !SKIP_FILES.has(entry.name.toLowerCase())) {
      acc.push(full);
    }
  }
  return acc;
}

const cmp = (a, b) => a.localeCompare(b, 'zh-Hans-CN', { numeric: true });

let files = walk(ROOT).sort((a, b) =>
  cmp(path.relative(ROOT, a).replace(/\\/g, '/'), path.relative(ROOT, b).replace(/\\/g, '/')),
);

// ONLY 环境变量：逗号分隔的路径关键词，用于生成精简版（不设置则打包全部）
const ONLY = (process.env.ONLY ? process.env.ONLY : '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
if (ONLY.length) {
  files = files.filter((f) => {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    return ONLY.some((k) => rel.includes(k));
  });
  console.log("  [精简模式] 关键词 " + ONLY.length + " 个 → 命中 " + files.length + " 篇");
}

const docs = files.map((file) => {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const dir = path.dirname(rel);
  const src = fs.readFileSync(file, 'utf8');
  const titleMatch = src.match(/^#\s+(.+)$/m);
  const title = (titleMatch ? titleMatch[1] : path.basename(rel, '.md')).trim();
  const slug = rel
    .replace(/\.md$/i, '')
    .replace(/\//g, '-')
    .replace(/[^\p{L}\p{N}._-]/gu, '-')
    .replace(/-+/g, '-');
  const { html, headings, qaCount } = renderDoc(src);
  return {
    file,
    rel,
    slug,
    fileName: `${slug}.html`,
    group: dir === '.' ? '总纲' : dir,
    title,
    html,
    headings,
    qaCount,
    words: src.replace(/\s/g, '').length,
  };
});

if (!docs.length) {
  console.error('没有找到任何 .md 文档');
  process.exit(1);
}

/* ---------- 分组 ---------- */
const groups = new Map();
for (const doc of docs) {
  if (!groups.has(doc.group)) groups.set(doc.group, []);
  groups.get(doc.group).push(doc);
}
const groupNames = [...groups.keys()].sort((a, b) => {
  if (a === '总纲') return -1;
  if (b === '总纲') return 1;
  return cmp(a, b);
});


// 构建标识（用于确认手机拿到的是哪一版）
const BUILD_STAMP = new Date().toLocaleString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" });
const BUILD_TAG = `构建 ${BUILD_STAMP} · KaTeX`;

const shortTitle = (t, n = 13) => (t.length > n ? `${t.slice(0, n)}…` : t);
const totalQa = docs.reduce((s, d) => s + d.qaCount, 0);
const totalWords = docs.reduce((s, d) => s + d.words, 0);

/* ---------- 目录（抽屉） ---------- */
function tocBundle() {
  const parts = ['<div class="drawer-actions"><a href="#top">回到顶部</a></div>'];
  for (const name of groupNames) {
    parts.push(`<h2>${esc(name)}</h2>`);
    for (const doc of groups.get(name)) {
      parts.push(`<a data-doc="${esc(doc.slug)}" href="#${esc(doc.slug)}">${esc(doc.title)}</a>`);
    }
  }
  return parts.join('\n');
}

function tocSingle(doc) {
  const parts = ['<div class="drawer-actions"><a href="index.html">← 总目录</a><a href="offline.html#quiz">🎯 抽背</a></div>'];
  if (doc.headings.length) {
    parts.push('<h2>本篇目录</h2>');
    for (const h of doc.headings) {
      parts.push(`<a class="sub" href="#${h.id}">${esc(h.text)}</a>`);
    }
  }
  parts.push('<h2>全部文档</h2>');
  for (const other of docs) {
    const cls = other === doc ? ' active' : '';
    parts.push(`<a class="${cls.trim()}" href="${other.fileName}">${esc(other.title)}</a>`);
  }
  return parts.join('\n');
}

/* ---------- 构建 ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 1) 合集（index.html 与 offline.html 内容一致，index 供在线访问，offline 供手机离线分发）
const bundleContent = docs
  .map(
    (doc, i) => `<article class="doc" data-id="${esc(doc.slug)}" data-title="${esc(doc.title)}" id="${esc(doc.slug)}"${i === 0 ? '' : ' hidden'}>
${doc.html || '<p class="empty">（空文档）</p>'}
</article>`,
  )
  .join('\n');

const bundleHtml = page({
  title: '面试备战 · 总目录',
  mode: 'bundle',
  slug: 'index',
  tocHtml: tocBundle(),
  contentHtml: `<div id="top"></div>\n${bundleContent}`,
  pagerHtml: `<div class="footer-note">共 ${docs.length} 篇 · ${totalWords.toLocaleString('zh-CN')} 字 · ${totalQa} 张自测卡 ｜ 构建于 ${new Date().toLocaleString('zh-CN', { hour12: false })}</div>`,
  quizHref: '#quiz',
});

fs.writeFileSync(path.join(OUT, 'index.html'), bundleHtml);
fs.writeFileSync(path.join(OUT, 'offline.html'), bundleHtml);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

// 2) 单篇
for (const doc of docs) {
  const idx = docs.indexOf(doc);
  const prev = docs[idx - 1];
  const next = docs[idx + 1];
  const pager = `<div class="pager">
  ${prev ? `<a href="${prev.fileName}">← ${esc(shortTitle(prev.title))}</a>` : '<a class="disabled">←</a>'}
  <a href="index.html">总目录</a>
  ${next ? `<a href="${next.fileName}">${esc(shortTitle(next.title))} →</a>` : '<a class="disabled">→</a>'}
</div>`;

  const html = page({
    title: doc.title,
    mode: 'single',
    slug: doc.slug,
    tocHtml: tocSingle(doc),
    contentHtml: `<article class="doc" data-id="${esc(doc.slug)}" data-title="${esc(doc.title)}">
${doc.html || '<p class="empty">（空文档）</p>'}
</article>`,
    pagerHtml: pager + `<div class="build-stamp">${BUILD_TAG}</div>`,
    quizHref: 'offline.html#quiz',
  });
  fs.writeFileSync(path.join(OUT, doc.fileName), html);
}

console.log(`✔ 构建完成 → dist/`);
console.log(`  文档 ${docs.length} 篇 · 约 ${totalWords.toLocaleString('zh-CN')} 字 · 自测卡 ${totalQa} 张`);
console.log(`  入口：dist/index.html（合集） / dist/offline.html（单文件离线版）`);
for (const name of groupNames) {
  console.log(`  [${name}] ${groups.get(name).length} 篇`);
}
