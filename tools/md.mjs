import MarkdownIt from 'markdown-it';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** HTML 转义 */
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

/** 生成锚点 id（保留中文，去掉标点） */
export function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
    .slice(0, 64);
}

/**
 * 自定义容器：
 *   :::qa 问题文本
 *   答案（可含任意 markdown）
 *   :::
 * → <details class="qa">，手机上点一下才展开，用于「追问链」「自测题」
 *
 *   :::card 小标题
 *   正文
 *   :::
 * → 带边框的卡片，用于「速查卡」「话术模板」
 */
function containerRule(state, startLine, endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  const m = /^:::(qa|card)\s*(.*)$/.exec(state.src.slice(start, max).trim());
  if (!m) return false;
  if (silent) return true;

  let nextLine = startLine + 1;
  let closed = false;
  let inFence = false;
  for (; nextLine < endLine; nextLine++) {
    const s = state.bMarks[nextLine] + state.tShift[nextLine];
    const e = state.eMarks[nextLine];
    const raw = state.src.slice(s, e).trim();
    if (raw.startsWith('```')) { inFence = !inFence; continue; }  // 代码块内的 ::: 不当作结束
    if (inFence) continue;
    if (raw === ':::') {
      closed = true;
      break;
    }
  }
  if (!closed) return false;

  const body = state.getLines(startLine + 1, nextLine, state.blkIndent, false);
  const inner = state.md.render(body);
  const kind = m[1];
  const title = m[2].trim();

  const token = state.push('html_block', '', 0);
  token.map = [startLine, nextLine + 1];
  token.content =
    kind === 'qa'
      ? `<details class="qa"><summary>${esc(title)}</summary><div class="qa-body">\n${inner}</div></details>\n`
      : `<div class="card">${title ? `<div class="card-title">${esc(title)}</div>\n` : ''}${inner}</div>\n`;

  if (kind === 'qa' && state.env) state.env.qaCount = (state.env.qaCount || 0) + 1;
  state.line = nextLine + 1;
  return true;
}

// 把过长的"公式行"折成多行（不依赖浏览器 CSS，任何设备都不会溢出）
const MATH_RE = /[=≈≠≤≥−×÷√∑∏∫θτβδλαγσμ^_{}]/;
const chW = (ch) => (ch.codePointAt(0) > 0x2E80 ? 2 : 1);
const visW = (arr) => arr.reduce((n, ch) => n + chW(ch), 0);
function wrapMathBlock(text, MAX, CONT) {
  MAX = MAX ? MAX : 40;
  CONT = CONT ? CONT : "  ";
  return text.split("\n").map((line) => {
    if (!MATH_RE.test(line)) return line;
    let cs = [...line];
    if (visW(cs) <= MAX) return line;
    const out = [];
    let first = true;
    while (cs.length) {
      const limit = first ? MAX : MAX - CONT.length;
      if (visW(cs) <= limit) { out.push((first ? "" : CONT) + cs.join("")); break; }
      let acc = 0;
      let cut = -1;
      let cutOp = -1;
      for (let i = 0; i < cs.length; i++) {
        acc += chW(cs[i]);
        if (acc > limit) break;
        if (cs[i] === " ") {
          cut = i;
          const prev = cs[i - 1];
          if (prev && "=\u2212+\u00D7,/[(\u2248\u2264\u2265".indexOf(prev) !== -1) cutOp = i;
        }
      }
      if (cutOp > 0) cut = cutOp;
      if (cut < 1) {
        acc = 0;
        cut = 0;
        for (let i = 0; i < cs.length; i++) {
          acc += chW(cs[i]);
          if (acc > limit) break;
          cut = i + 1;
        }
        if (cut < 1) cut = 1;
      }
      out.push((first ? "" : CONT) + cs.slice(0, cut).join("").replace(/\s+$/, ""));
      cs = cs.slice(cut);
      while (cs.length > 0 && cs[0] === " ") cs.shift();
      first = false;
    }
    return out.join("\n");
  }).join("\n");
}

function createMd() {
  const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

  md.block.ruler.before('fence', 'container', containerRule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });

  // 标题加锚点 + 收集(用于本文目录)
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const inline = tokens[idx + 1];
    const text = (inline && inline.content ? inline.content : '').trim();
    const level = Number(token.tag.slice(1));
    if (!env.usedIds) env.usedIds = new Set();
    let id = slugify(text) || `h-${idx}`;
    const base = id;
    let n = 2;
    while (env.usedIds.has(id)) id = `${base}-${n++}`;
    env.usedIds.add(id);
    token.attrSet('id', id);
    if (env.headings && level >= 2 && level <= 3) env.headings.push({ level, text, id });
    return self.renderToken(tokens, idx, options);
  };

  // 表格包一层，手机上可横向滑动
  md.renderer.rules.table_open = () => '<div class="table-wrap"><table>';
  md.renderer.rules.table_close = () => '</table></div>';

  // 代码块：无语言标记的视为"公式 / 示例块"，加 class 便于单独排版（自动换行）
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const info = (token.info || '').trim().split(/\s+/)[0];
    const body = md.utils.escapeHtml(token.content);
    if (info) {
      return `<pre><code class="language-${md.utils.escapeHtml(info)}">${body}</code></pre>\n`;
    }
    return `<pre class="plain"><code>${md.utils.escapeHtml(wrapMathBlock(token.content))}</code></pre>\n`;
  };

  // 外链新窗口
  const defaultLink = md.renderer.rules.link_open ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href') || '';
    if (/^https?:/i.test(href)) {
      tokens[idx].attrSet('target', '_blank');
      tokens[idx].attrSet('rel', 'noopener noreferrer');
    }
    return defaultLink(tokens, idx, options, env, self);
  };

  return md;
}

/**
 * 渲染一篇 markdown
 * @returns {{html: string, headings: Array<{level:number,text:string,id:string}>, qaCount: number}}
 */
export function renderDoc(src) {
  const md = createMd();
  const env = { headings: [], qaCount: 0 };
  const html = md.render(src, env);
  return { html, headings: env.headings, qaCount: env.qaCount };
}
