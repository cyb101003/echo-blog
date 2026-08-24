# 百度收录配置

网站已经具备百度抓取所需的技术基础：

- 正式域名固定为 `https://www.echobb.me`
- 裸域 `https://echobb.me` 使用 308 永久重定向到 `www` 主站
- `robots.txt` 明确允许 `Baiduspider`
- 百度可直接读取的单层 Sitemap：`https://www.echobb.me/sitemap.xml`
- 页面具备 canonical、可索引 robots、中文标题与描述、人物结构化数据
- 可选的百度 HTML 标签验证：构建环境变量 `BAIDU_SITE_VERIFICATION`
- 普通收录 API 提交脚本：`npm run seo:baidu`

## 首次接入

1. 登录百度搜索资源平台并添加站点 `https://www.echobb.me`。
2. 选择 HTML 标签验证，把标签中的 `content` 值设置为 Vercel 环境变量 `BAIDU_SITE_VERIFICATION`，然后重新部署。
3. 验证站点后，在“资源提交 → 普通收录 → sitemap”提交：

   ```text
   https://www.echobb.me/sitemap.xml
   ```

4. 在“普通收录 → API提交”复制 token；本地构建后执行：

   ```bash
   npm run build
   BAIDU_PUSH_TOKEN='TOKEN' npm run seo:baidu
   ```

`TOKEN` 只放在本机或 Vercel Secret 中，不提交到 GitHub。链接提交能帮助百度更快发现页面，最终是否收录仍由百度根据内容与质量判断。
