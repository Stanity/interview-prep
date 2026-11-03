import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, '..', 'node_modules', 'katex', 'dist');

let cssCache = null;

/**
 * 读取 katex.min.css，并把其中引用的 woff2 字体全部转成 base64 data URI。
 * 这样离线单文件不依赖任何外部资源。
 */
export function inlinedKatexCss() {
  if (cssCache) return cssCache;

  let css = fs.readFileSync(path.join(DIST, 'katex.min.css'), 'utf8');
  let inlined = 0;
  let missing = 0;

  css = css.replace(
    /url\((["']?)fonts\/(KaTeX_[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\.woff2)\1\)/g,
    (raw, quote, file) => {
      const p = path.join(DIST, 'fonts', file);
      if (!fs.existsSync(p)) {
        missing++;
        return raw;
      }
      const b64 = fs.readFileSync(p).toString('base64');
      inlined++;
      return `url(data:font/woff2;base64,${b64})`;
    },
  );

  // 去掉还没被替换的 url()（一般是 ttf/woff 兜底，浏览器有 woff2 就不会用）
  css = css.replace(/,url\((["']?)fonts\/KaTeX_[^)]+\.(?:ttf|woff)\1\)/g, '');

  console.log(`  KaTeX 字体内联: ${inlined} 个（缺失 ${missing}）`);
  cssCache = css;
  return css;
}

/**
 * 服务端渲染公式（构建时执行，客户端不需要加载 KaTeX JS）
 * @param {string} tex LaTeX 源码
 * @param {boolean} displayMode true = 独立成行
 */
export function renderMath(tex, displayMode) {
  try {
    return katex.renderToString(tex, {
      displayMode: !!displayMode,
      throwOnError: false,
      errorColor: '#cc0000',
      strict: 'ignore',
      trust: false,
      output: 'html',
    });
  } catch (e) {
    // 渲染失败时降级为可读的纯文本，避免整篇构建失败
    const safe = String(tex).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    return `<code class="math-error" title="${safe.replace(/"/g, '&quot;')}">${safe}</code>`;
  }
}
