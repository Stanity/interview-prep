/** 移动端 UI：样式 + 客户端脚本 + 页面骨架 */
import { inlinedKatexCss } from './math.mjs';

const LIGHT_VARS = `
  --fs: 17px;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "DejaVu Sans Mono", "Noto Sans Mono", "Segoe UI Symbol", "Cambria Math", "Apple Symbols", monospace;
  --bg: #f7f7f5;
  --fg: #1b1c1e;
  --muted: #5f6672;
  --line: #e3e4e8;
  --card: #ffffff;
  --code-bg: #f0f1f3;
  --accent: #2f6fed;
  --accent-soft: #e8eefc;
  --qa-open: #eef3fe;
  --mark: #fff2b8;
  --shadow: 0 10px 34px rgba(0,0,0,.14);
`;

const DARK_VARS = `
  --bg: #101214;
  --fg: #e7e8ea;
  --muted: #9aa2ad;
  --line: #282c31;
  --card: #171a1d;
  --code-bg: #1e2328;
  --accent: #79b0ff;
  --accent-soft: #1c2530;
  --qa-open: #18222e;
  --mark: #4a3f10;
  --shadow: 0 10px 34px rgba(0,0,0,.55);
`;

export const CSS = `
:root { color-scheme: light; ${LIGHT_VARS} }
:root[data-theme="dark"] { color-scheme: dark; ${DARK_VARS} }
@media (prefers-color-scheme: dark) { :root[data-theme="auto"] { color-scheme: dark; ${DARK_VARS} } }

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  font-size: var(--fs);
  line-height: 1.78;
  background: var(--bg);
  color: var(--fg);
  overflow-wrap: break-word;
}
a { color: var(--accent); text-decoration: none; }
[hidden] { display: none !important; }

/* ---------- 顶栏 ---------- */
.topbar {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; gap: 2px;
  padding: calc(6px + env(safe-area-inset-top)) 8px 6px;
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--line);
}
.tb-btn {
  flex: 0 0 auto; width: 40px; height: 40px; display: grid; place-items: center;
  background: none; border: 0; border-radius: 10px; color: var(--fg);
  font-size: 1.02rem; cursor: pointer; text-decoration: none;
}
.tb-btn:active { background: var(--accent-soft); }
.tb-title {
  flex: 1 1 auto; min-width: 0; font-size: .92rem; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px;
}

/* ---------- 正文 ---------- */
main { display: block; }
article.doc { max-width: 46rem; margin: 0 auto; padding: 10px 16px 90px; }
article.doc > h1:first-child { margin-top: .5em; }
h1 { font-size: 1.42em; line-height: 1.35; margin: .6em 0 .5em; }
h2 {
  font-size: 1.16em; margin: 1.7em 0 .55em; padding-bottom: .22em;
  border-bottom: 1px solid var(--line); scroll-margin-top: 64px;
}
h3 {
  font-size: 1.03em; margin: 1.25em 0 .4em; padding-left: 9px;
  border-left: 3px solid var(--accent); scroll-margin-top: 64px;
}
h4 { font-size: 1em; margin: 1em 0 .3em; color: var(--muted); }
p { margin: .55em 0; }
ul, ol { margin: .5em 0; padding-left: 1.35em; }
li { margin: .26em 0; }
li > ul, li > ol { margin: .2em 0; }
hr { border: 0; border-top: 1px solid var(--line); margin: 1.6em 0; }
strong { font-weight: 700; }
blockquote {
  margin: .9em 0; padding: .3em 12px; border-left: 3px solid var(--line);
  color: var(--muted); background: color-mix(in srgb, var(--card) 60%, transparent);
  border-radius: 0 8px 8px 0;
}
code {
  font-family: var(--mono);
  background: var(--code-bg); padding: .1em .34em; border-radius: 5px; font-size: .9em;
  overflow-wrap: anywhere; word-break: break-word;
}
pre {
  background: var(--code-bg); padding: 11px 13px; border-radius: 10px;
  font-size: .84em; line-height: 1.68; margin: .8em 0;
  white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
}
pre code {
  background: none; padding: 0; font-size: 1em; font-family: inherit;
  white-space: inherit; overflow-wrap: inherit; word-break: inherit;
}
/* 无语言标记的块 = 公式 / 示例：字号略大、加边框，视觉上与代码区分 */
pre.plain {
  border: 1px solid var(--line);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
  font-size: .86em; line-height: 1.85; font-family: var(--mono);
  letter-spacing: -.01em;
}
pre.plain code { color: var(--fg); }
.table-wrap {
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  margin: .85em 0; border: 1px solid var(--line); border-radius: 10px;
}
table { border-collapse: collapse; width: 100%; font-size: .88em; }
th, td { border-bottom: 1px solid var(--line); padding: 8px 10px; text-align: left; vertical-align: top; min-width: 5em; }
th { background: var(--code-bg); font-weight: 600; white-space: nowrap; }
tr:last-child td { border-bottom: 0; }
mark { background: var(--mark); color: inherit; padding: 0 2px; border-radius: 3px; }

/* ---------- QA 折叠卡 ---------- */
details.qa {
  background: var(--card); border: 1px solid var(--line); border-radius: 12px;
  margin: .6em 0; overflow: hidden;
}
details.qa > summary {
  position: relative; cursor: pointer; list-style: none;
  padding: 11px 34px 11px 30px; font-weight: 600; font-size: .97em;
}
details.qa > summary::-webkit-details-marker { display: none; }
details.qa > summary::before {
  content: "Q"; position: absolute; left: 10px; top: 11px;
  color: var(--accent); font-weight: 800; font-size: .85em;
}
details.qa > summary::after {
  content: "▾"; position: absolute; right: 13px; top: 11px; opacity: .55; transition: transform .18s;
}
details.qa[open] > summary::after { transform: rotate(180deg); }
details.qa[open] { background: var(--qa-open); border-color: var(--accent); }
.qa-body { padding: 2px 12px 8px; border-top: 1px dashed var(--line); font-size: .95em; }
.qa-body > :first-child { margin-top: .5em; }

/* ---------- 卡片 ---------- */
.card {
  background: var(--card); border: 1px solid var(--line); border-left: 3px solid var(--accent);
  border-radius: 10px; padding: 10px 13px; margin: .85em 0;
}
.card-title { font-weight: 700; color: var(--accent); margin-bottom: .25em; font-size: .95em; }

/* ---------- 抽屉目录 ---------- */
.drawer {
  position: fixed; top: 0; bottom: 0; left: 0; width: min(86vw, 350px); z-index: 60;
  background: var(--card); box-shadow: var(--shadow); overflow-y: auto;
  padding: calc(14px + env(safe-area-inset-top)) 14px calc(30px + env(safe-area-inset-bottom));
  transform: translateX(-102%); transition: transform .22s ease;
}
.drawer.open { transform: none; }
.drawer h2 { font-size: .82rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); border: 0; margin: 1.2em 0 .4em; }
.drawer a { display: block; padding: 9px 10px; border-radius: 9px; color: var(--fg); font-size: .92rem; line-height: 1.45; }
.drawer a.sub { font-size: .85rem; color: var(--muted); padding-left: 20px; }
.drawer a.active, .drawer a:active { background: var(--accent-soft); color: var(--accent); }
.drawer .drawer-actions { display: flex; gap: 8px; margin-top: 1.4em; }
.drawer .drawer-actions a {
  flex: 1; text-align: center; border: 1px solid var(--line); padding: 10px; font-size: .86rem;
}
#scrim {
  position: fixed; inset: 0; z-index: 55; background: rgba(0,0,0,.42);
  opacity: 0; pointer-events: none; transition: opacity .2s;
}
#scrim.show { opacity: 1; pointer-events: auto; }

/* ---------- 全屏浮层（搜索 / 抽背） ---------- */
.overlay {
  position: fixed; inset: 0; z-index: 80; background: var(--bg);
  display: flex; flex-direction: column;
  padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
}
.ov-head {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}
.ov-head input {
  flex: 1; min-width: 0; border: 1px solid var(--line); background: var(--card); color: var(--fg);
  border-radius: 10px; padding: 10px 12px; font-size: .95rem; font-family: inherit;
}
.ov-head button, .ov-btn {
  background: var(--card); color: var(--fg); border: 1px solid var(--line);
  border-radius: 10px; padding: 9px 12px; font-size: .9rem; font-family: inherit; cursor: pointer;
}
.ov-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.hit { padding: 11px 14px; border-bottom: 1px solid var(--line); }
.hit .hit-doc { font-size: .78rem; color: var(--muted); margin-bottom: 3px; }
.hit .hit-text { font-size: .9rem; line-height: 1.6; }
.hit:active { background: var(--accent-soft); }
.empty { padding: 30px 16px; text-align: center; color: var(--muted); font-size: .9rem; }

/* 抽背 */
.quiz-wrap { flex: 1; display: flex; flex-direction: column; padding: 14px; gap: 12px; overflow-y: auto; }
.quiz-meta { display: flex; justify-content: space-between; align-items: center; font-size: .82rem; color: var(--muted); }
.quiz-card {
  flex: 1; min-height: 40vh; background: var(--card); border: 1px solid var(--line);
  border-radius: 14px; padding: 18px 16px; overflow-y: auto;
}
.quiz-q { font-weight: 700; font-size: 1.02rem; line-height: 1.6; }
.quiz-doc { font-size: .76rem; color: var(--muted); margin-bottom: 8px; }
.quiz-a { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--line); font-size: .93rem; }
.quiz-actions { display: flex; gap: 8px; }
.quiz-actions button { flex: 1; padding: 13px 8px; font-size: .92rem; border-radius: 12px; }
.quiz-actions .primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.quiz-done { text-align: center; color: var(--muted); padding: 40px 10px; }

/* ---------- 首页 ---------- */
.index-head { max-width: 46rem; margin: 0 auto; padding: 22px 16px 6px; }
.index-head h1 { margin: 0 0 .3em; font-size: 1.35em; }
.index-head p { color: var(--muted); font-size: .9em; margin: 0; }
.group-title {
  max-width: 46rem; margin: 1.7em auto .5em; padding: 0 16px;
  font-size: .8rem; letter-spacing: .05em; text-transform: uppercase; color: var(--muted);
}
.doc-list { max-width: 46rem; margin: 0 auto; padding: 0 16px; display: grid; gap: 9px; }
.doc-item {
  display: block; padding: 13px 14px; background: var(--card); color: var(--fg);
  border: 1px solid var(--line); border-radius: 12px;
}
.doc-item:active { background: var(--accent-soft); }
.doc-item .di-title { font-weight: 600; font-size: .96rem; }
.doc-item .di-meta { font-size: .78rem; color: var(--muted); margin-top: 3px; }
.pager { display: flex; gap: 8px; max-width: 46rem; margin: 26px auto 0; padding: 0 16px; }
.pager a {
  flex: 1; text-align: center; padding: 12px 8px; border: 1px solid var(--line);
  border-radius: 12px; background: var(--card); color: var(--fg); font-size: .86rem;
}
.pager a.disabled { opacity: .35; pointer-events: none; }
.footer-note { max-width: 46rem; margin: 26px auto 0; padding: 0 16px 40px; color: var(--muted); font-size: .78rem; }

@media (min-width: 720px) {
  article.doc, .doc-list, .index-head, .pager, .group-title, .footer-note { padding-left: 24px; padding-right: 24px; }
}

.build-stamp {
  max-width: 46rem; margin: 18px auto 0; padding: 0 16px 28px;
  font-size: .72rem; color: var(--muted); text-align: center;
}
/* ---------- 公式（构建时由 KaTeX 预渲染，客户端无需 JS） ---------- */
.math-block {
  margin: .9em 0; padding: 12px 12px;
  background: var(--code-bg);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  text-align: left;
}
.math-block .katex-display { margin: 0; text-align: left; }
.math-block .katex { font-size: .98em; }
.math-inline .katex { font-size: 1em; }
.math-inline { white-space: nowrap; }
code.math-error {
  color: #cc0000; background: #fff2f2; border: 1px solid #ffd0d0;
}
` + '\n/* ===== KaTeX ===== */\n' + inlinedKatexCss();

const CLIENT_JS = `
(function () {
  'use strict';
  var root = document.documentElement;
  var body = document.body;
  var MODE = body.getAttribute('data-mode') || 'single';
  var SLUG = body.getAttribute('data-slug') || '';

  function $(id) { return document.getElementById(id); }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function hash(s) {
    var h = 5381, i = 0;
    for (; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; }
    return String(h >>> 0);
  }

  /* ---------- 主题 ---------- */
  var themes = ['auto', 'light', 'dark'];
  var themeIcon = { auto: '🌗', light: '☀️', dark: '🌙' };
  var themeBtn = $('btn-theme');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.textContent = themeIcon[t] || '🌗';
  }
  applyTheme(lsGet('theme', 'auto'));
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = themes[(themes.indexOf(lsGet('theme', 'auto')) + 1) % themes.length];
    lsSet('theme', next); applyTheme(next);
  });

  /* ---------- 字号 ---------- */
  var sizes = [15, 17, 19, 21];
  function applyFs(v) { root.style.setProperty('--fs', v + 'px'); }
  var savedFs = Number(lsGet('fs', 17)) || 17;
  if (sizes.indexOf(savedFs) < 0) savedFs = 17;
  applyFs(savedFs);
  var fsBtn = $('btn-fs');
  if (fsBtn) fsBtn.addEventListener('click', function () {
    var cur = sizes.indexOf(Number(lsGet('fs', 17)) || 17);
    var next = sizes[(cur + 1) % sizes.length];
    lsSet('fs', next); applyFs(next);
  });

  /* ---------- 抽屉目录 ---------- */
  var drawer = $('toc'), scrim = $('scrim');
  function openDrawer() { if (drawer) drawer.classList.add('open'); if (scrim) scrim.classList.add('show'); }
  function closeDrawer() { if (drawer) drawer.classList.remove('open'); if (scrim) scrim.classList.remove('show'); }
  var menuBtn = $('btn-menu');
  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (scrim) scrim.addEventListener('click', closeDrawer);
  each(document.querySelectorAll('#toc a'), function (a) {
    a.addEventListener('click', function (e) {
      var docId = a.getAttribute('data-doc');
      if (MODE === 'bundle' && docId) { e.preventDefault(); showDoc(docId); }
      closeDrawer();
    });
  });

  /* ---------- 文档切换（bundle 模式） ---------- */
  function articleList() { return document.querySelectorAll('article.doc'); }
  function currentDoc() {
    var a = document.querySelector('article.doc:not([hidden])');
    return a ? a.getAttribute('data-id') : SLUG;
  }
  function saveScroll() {
    lsSet('scroll:' + currentDoc(), String(window.scrollY || 0));
  }
  function showDoc(id, keepScroll) {
    each(articleList(), function (a) { a.hidden = a.getAttribute('data-id') !== id; });
    var cur = document.querySelector('article.doc[data-id="' + id + '"]');
    var title = cur ? cur.getAttribute('data-title') : '';
    var tt = $('tb-title'); if (tt) tt.textContent = title;
    if (title) document.title = title + ' · 面试备战';
    lsSet('lastdoc', id);
    var y = keepScroll ? window.scrollY : Number(lsGet('scroll:' + id, 0)) || 0;
    if (keepScroll) { if (cur && cur.scrollIntoView) window.scrollTo(0, 0); } else { window.scrollTo(0, y); }
    each(document.querySelectorAll('#toc a[data-doc]'), function (a) {
      a.classList.toggle('active', a.getAttribute('data-doc') === id);
    });
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
  }
  if (MODE === 'bundle') {
    var startId = (location.hash || '').replace(/^#/, '');
    try { startId = decodeURIComponent(startId); } catch (e) {}
    var lastDoc = lsGet('lastdoc', '');
    if (!startId || !document.querySelector('article.doc[data-id="' + startId + '"]')) startId = lastDoc;
    if (startId && document.querySelector('article.doc[data-id="' + startId + '"]')) showDoc(startId);
    else {
      var firstDoc = articleList()[0];
      if (firstDoc) showDoc(firstDoc.getAttribute('data-id'));
      setTimeout(openDrawer, 260);
    }
  } else {
    var y0 = Number(lsGet('scroll:' + SLUG, 0)) || 0;
    if (y0 > 200 && !location.hash) window.scrollTo(0, y0);
  }
  var saveTimer = null;
  window.addEventListener('scroll', function () {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveScroll, 350);
  }, { passive: true });
  window.addEventListener('pagehide', saveScroll);

  /* ---------- 搜索 ---------- */
  var searchOv = $('search'), searchInput = $('search-input'), searchHits = $('search-hits');
  function openSearch() {
    if (!searchOv) return;
    searchOv.hidden = false;
    setTimeout(function () { if (searchInput) searchInput.focus(); }, 60);
    renderHits(searchInput ? searchInput.value : '');
  }
  function closeSearch() { if (searchOv) searchOv.hidden = true; }
  var searchBtn = $('btn-search');
  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  var searchClose = $('search-close');
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchInput) searchInput.addEventListener('input', function () { renderHits(searchInput.value); });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function renderHits(q) {
    if (!searchHits) return;
    q = (q || '').trim();
    if (q.length < 1) { searchHits.innerHTML = '<div class="empty">输入关键词，搜全部文档正文</div>'; return; }
    var out = [], total = 0;
    each(articleList(), function (art) {
      var text = (art.textContent || '').replace(/\\s+/g, ' ');
      var lower = text.toLowerCase(), needle = q.toLowerCase(), from = 0, hits = 0;
      var title = art.getAttribute('data-title') || '';
      var id = art.getAttribute('data-id') || '';
      while (hits < 3) {
        var i = lower.indexOf(needle, from);
        if (i < 0) break;
        var s = Math.max(0, i - 42), e = Math.min(text.length, i + needle.length + 58);
        var snippet = esc(text.slice(s, i)) + '<mark>' + esc(text.slice(i, i + needle.length)) + '</mark>' + esc(text.slice(i + needle.length, e));
        out.push('<div class="hit" data-doc="' + id + '"><div class="hit-doc">' + esc(title) + '</div><div class="hit-text">' + (s > 0 ? '…' : '') + snippet + (e < text.length ? '…' : '') + '</div></div>');
        hits++; total++; from = i + needle.length;
      }
    });
    if (!total) { searchHits.innerHTML = '<div class="empty">没有命中「' + esc(q) + '」</div>'; return; }
    searchHits.innerHTML = out.join('');
    each(searchHits.querySelectorAll('.hit'), function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-doc');
        closeSearch();
        if (MODE === 'bundle' && id) showDoc(id);
      });
    });
  }

  /* ---------- 抽背 ---------- */
  var quizOv = $('quiz');
  var quizQ = $('quiz-q'), quizA = $('quiz-a'), quizMeta = $('quiz-progress'), quizDoc = $('quiz-doc'),
      showBtn = $('quiz-show'), knownBtn = $('quiz-known'), nextBtn = $('quiz-next'), resetBtn = $('quiz-reset'), quizCard = $('quiz-card');
  var queue = [], qIdx = 0, known = {}, active = false;

  function loadKnown() {
    try { known = JSON.parse(lsGet('quiz:known', '{}')) || {}; } catch (e) { known = {}; }
  }
  function saveKnown() { lsSet('quiz:known', JSON.stringify(known)); }
  function knownCount() { var n = 0, k; for (k in known) { if (known[k]) n++; } return n; }

  function collectQA() {
    var out = [];
    var scope = MODE === 'bundle' ? document.querySelectorAll('article.doc details.qa') : document.querySelectorAll('details.qa');
    each(scope, function (d) {
      var s = d.querySelector('summary'), b = d.querySelector('.qa-body');
      if (!s || !b) return;
      var art = d.closest ? d.closest('article.doc') : null;
      out.push({
        q: (s.textContent || '').trim(),
        a: b.innerHTML,
        doc: art ? art.getAttribute('data-title') || '' : (body.getAttribute('data-title') || ''),
        id: hash((s.textContent || '').trim())
      });
    });
    return out;
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }

  function startQuiz(all) {
    if (!quizOv) return;
    loadKnown();
    var pool = collectQA();
    if (!pool.length) { alert('还没有自测卡：文档里用 :::qa 写卡片后重新构建即可。'); return; }
    queue = all ? shuffle(pool.slice()) : shuffle(pool.filter(function (c) { return !known[c.id]; }));
    if (!queue.length) queue = shuffle(pool.slice());
    qIdx = 0; active = true;
    quizOv.hidden = false;
    renderQuiz();
  }
  function closeQuiz() { if (quizOv) quizOv.hidden = true; active = false; }
  function renderQuiz() {
    if (!quizQ) return;
    var card = queue[qIdx];
    if (!card) {
      quizQ.textContent = '本轮完成 🎉';
      quizA.hidden = true; quizDoc.textContent = '';
      if (showBtn) showBtn.hidden = true;
      if (knownBtn) knownBtn.hidden = true;
      if (quizMeta) quizMeta.textContent = '共 ' + queue.length + ' 题 · 已记住 ' + knownCount();
      return;
    }
    quizDoc.textContent = card.doc || '';
    quizQ.textContent = card.q;
    quizA.innerHTML = card.a;
    quizA.hidden = true;
    if (showBtn) { showBtn.hidden = false; showBtn.textContent = '看答案'; }
    if (knownBtn) knownBtn.hidden = true;
    if (quizMeta) quizMeta.textContent = (qIdx + 1) + ' / ' + queue.length + ' · 已记住 ' + knownCount();
    if (quizCard) quizCard.scrollTop = 0;
  }
  function nextQuiz() { qIdx++; renderQuiz(); }

  var quizBtn = $('btn-quiz');
  if (quizBtn) quizBtn.addEventListener('click', function (e) {
    if (MODE === 'bundle') { e.preventDefault(); if (!active) startQuiz(false); else closeQuiz(); }
  });
  if (location.hash === '#quiz' && MODE === 'bundle') startQuiz(false);
  var quizClose = $('quiz-close');
  if (quizClose) quizClose.addEventListener('click', closeQuiz);
  if (showBtn) showBtn.addEventListener('click', function () {
    if (!quizA) return;
    quizA.hidden = false; showBtn.hidden = true; if (knownBtn) knownBtn.hidden = false;
  });
  if (knownBtn) knownBtn.addEventListener('click', function () {
    var card = queue[qIdx];
    if (card) { known[card.id] = 1; saveKnown(); }
    nextQuiz();
  });
  if (nextBtn) nextBtn.addEventListener('click', nextQuiz);
  if (resetBtn) resetBtn.addEventListener('click', function () {
    known = {}; saveKnown(); startQuiz(true);
  });

  /* ---------- Esc 关闭 ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (searchOv && !searchOv.hidden) closeSearch();
    else if (quizOv && !quizOv.hidden) closeQuiz();
    else closeDrawer();
  });
})();
`;

/** 页面骨架 */
export function page({ title, mode, slug, tocHtml, contentHtml, pagerHtml = '', quizHref = '#quiz' }) {
  return `<!doctype html>
<html lang="zh-CN" data-theme="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<meta name="format-detection" content="telephone=no">
<meta name="theme-color" content="#101214">
<title>${title} · 面试备战</title>
<style>${CSS}</style>
</head>
<body data-mode="${mode}" data-slug="${slug}">
<header class="topbar">
  <button id="btn-menu" class="tb-btn" aria-label="目录">☰</button>
  <div class="tb-title" id="tb-title">${title}</div>
  <button id="btn-fs" class="tb-btn" aria-label="字号">Aa</button>
  <button id="btn-theme" class="tb-btn" aria-label="主题">🌗</button>
  <button id="btn-search" class="tb-btn" aria-label="搜索">🔍</button>
  <a id="btn-quiz" class="tb-btn" href="${quizHref}" aria-label="抽背">🎯</a>
</header>
<nav id="toc" class="drawer" aria-label="目录">${tocHtml}</nav>
<div id="scrim"></div>
<main id="content">${contentHtml}</main>
${pagerHtml}
<div id="search" class="overlay" hidden>
  <div class="ov-head">
    <input id="search-input" type="search" placeholder="搜索正文关键词…" autocomplete="off">
    <button id="search-close">关闭</button>
  </div>
  <div class="ov-body" id="search-hits"><div class="empty">输入关键词，搜全部文档正文</div></div>
</div>
<div id="quiz" class="overlay" hidden>
  <div class="ov-head">
    <span style="flex:1;font-size:.9rem;font-weight:600">🎯 抽背自测</span>
    <button id="quiz-reset">重置</button>
    <button id="quiz-close">关闭</button>
  </div>
  <div class="quiz-wrap">
    <div class="quiz-meta"><span id="quiz-progress">0 / 0</span><span>点「看答案」再自评</span></div>
    <div class="quiz-card" id="quiz-card">
      <div class="quiz-doc" id="quiz-doc"></div>
      <div class="quiz-q" id="quiz-q"></div>
      <div class="quiz-a" id="quiz-a" hidden></div>
    </div>
    <div class="quiz-actions">
      <button id="quiz-show" class="primary">看答案</button>
      <button id="quiz-known" hidden>记住了 ✓</button>
      <button id="quiz-next">下一题 →</button>
    </div>
  </div>
</div>
<script>${CLIENT_JS}</script>
</body>
</html>
`;
}
