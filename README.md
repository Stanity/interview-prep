# 秋招面试备战（大模型 / Agent）

Markdown 源 → 手机端可读 HTML。每次改完 `.md`，跑一次构建即可生成手机上能翻的页面。

## 目录约定

```
面试/
├─ 00-总纲与14天排期.md      # 总纲（首页第一篇）
├─ 01-简历深挖/…             # 每篇一个 md，文件夹名 = 手机版里的分组
├─ 02-Agent工程/…
├─ tools/                    # 构建脚本
└─ dist/                     # 构建产物（不入库）
```

## 命令

```bash
npm install        # 首次
npm run build      # 生成 dist/
npm run serve      # 局域网预览（手机同 WiFi 打开打印出的 IP）
npm run dev        # 构建 + 预览
```

## 产物

| 文件 | 用途 |
|---|---|
| `dist/index.html` | 合集版（目录抽屉 + 全文 + 搜索 + 抽背） |
| `dist/offline.html` | **单文件离线版**，微信发给手机即可打开 |
| `dist/<篇名>.html` | 单篇版，打开更快，适合分享 |

## 写文档用的两个语法

```
:::qa 问题文本
答案（任意 markdown）
:::
```
→ 折叠问答卡，手机点一下展开；`🎯 抽背` 会自动收集成题库。

```
:::card 小标题
正文
:::
```
→ 带左侧强调线的卡片，用于「30 秒口述版」「话术模板」。

## 部署到 GitHub Pages（手机在线访问）

**已部署**：https://Stanity.github.io/interview-prep/

- 手机浏览器打开 → 「分享 / 菜单」→ **添加到主屏幕**，即可像 App 一样随时翻。
- 仓库：https://github.com/Stanity/interview-prep （public，页面已加 `noindex`，不会被搜索引擎收录）
- 首次配置只需做一次：**Settings → Pages → Build and deployment → Source 选 `GitHub Actions`**。

### 日常更新：一条命令

```bash
npm run publish                        # 构建 + 提交 + 推送，Pages 约 1–2 分钟后自动更新
npm run publish "docs: D1 RePref-Fact" # 自定义提交信息
```

### 从零搭一个（备查）

1. 新建仓库（Public，**不要**勾选 README/.gitignore/license，保持空仓库）：
   ```bash
   git init -b main
   git add -A
   git commit -m "chore: 面试备战资料 + 手机版构建"
   git remote add origin git@github.com:<你的账号>/<仓库名>.git
   git push -u origin main
   ```
2. 仓库 **Settings → Pages → Source 选 `GitHub Actions`**。
3. 之后每次 `git push`，`.github/workflows/pages.yml` 自动构建发布。

> 注：免费账号只有 public 仓库能开 Pages。本仓库内容已脱敏（无姓名/手机/邮箱/院所名），并在每个页面注入 `noindex`。
