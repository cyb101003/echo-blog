# echo personal blog

echo 的深色个人技术博客。项目已经从单页静态站迁移为 Astro 7 静态内容工程。

网站：[echobb.me](https://echobb.me)（统一跳转到 `https://www.echobb.me`）。

## 已实现

- 深色、无渐变、移动优先的响应式界面
- Markdown 内容集合与严格 Schema 校验
- 文章详情、上一篇/下一篇、标签、归档、RSS 和 Sitemap
- 独立 About 页面与个人身份、社交链接配置
- Pagefind 1.5 Component UI 本地全文搜索
- 每篇文章自动生成 1200×630 PNG 分享图
- 构建时同步 `cyb101003` 的全部公开仓库
- 原创、Fork、归档、模板、镜像类型识别与筛选
- GitHub API 失败时继续使用上次成功缓存
- 阅读进度、文章目录、标题锚点、代码复制与返回顶部
- 正确区分 WebSite/Person 与 BlogPosting 结构化数据
- Web App Manifest、资源体积预算和 GitHub Actions 构建检查
- Cloudflare Pages 与 Vercel 安全响应头配置

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:4321`。

生产构建：

```bash
npm run build
npm run preview
```

构建会依次同步 GitHub、执行 Astro 类型检查、生成静态页面、建立搜索索引并检查资源体积。

## 添加文章

在 `src/content/posts/` 新建 Markdown 文件：

```md
---
title: "文章标题"
description: "文章简介"
publishedAt: 2026-08-01
tags: ["Astro", "开发日志"]
draft: false
featured: false
---

正文内容。
```

## 修改个人资料

- 姓名、年龄、社交链接：`src/config.ts`
- 头像：`public/assets/echo-avatar.jpg`
- 首页内容与资料：`src/pages/index.astro`
- About 页面：`src/pages/about/index.astro`
- 设计变量和响应式布局：`src/styles/global.css`

社交链接已在 `src/config.ts` 中配置。首页精选项目在 `src/pages/index.astro` 的 `featuredNames` 中调整；全部公开仓库仍在项目页展示。

## 部署

默认域名为 `https://www.echobb.me`。部署到其他域名时可覆盖：

```bash
SITE_URL=https://你的域名 npm run build
```

项目可直接部署到 Cloudflare Pages 或 Vercel：构建命令为 `npm run build`，输出目录为 `dist`。
