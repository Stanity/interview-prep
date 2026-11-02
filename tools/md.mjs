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
  for (; nextLine < endLine; nextLine++) {
    const s = state.bMarks[nextLine] + state.tShift[nextLine];
    const e = state.eMarks[nextLine];
    if (state.src.slice(s, e).trim() === ':::') {
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
