import { readFile } from "node:fs/promises";
import http from "node:http";

const site = (process.env.BAIDU_SITE ?? "https://echobb.me").replace(/\/$/, "");
const token = process.env.BAIDU_PUSH_TOKEN?.trim();

if (!token) {
  console.error("缺少 BAIDU_PUSH_TOKEN。请从百度搜索资源平台的“普通收录 → API提交”复制 token 后再运行。");
  process.exit(1);
}

const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map(match => match[1].replaceAll("&amp;", "&"))
  .filter(url => url.startsWith(`${site}/`));

if (urls.length === 0) {
  console.error("dist/sitemap.xml 中没有可提交的网址。请先运行 npm run build。");
  process.exit(1);
}

const payload = urls.join("\n");
const endpoint = new URL(`http://data.zz.baidu.com/urls?site=${encodeURIComponent(new URL(site).host)}&token=${encodeURIComponent(token)}`);

const result = await new Promise((resolve, reject) => {
  const request = http.request(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Length": Buffer.byteLength(payload)
    }
  }, response => {
    let body = "";
    response.setEncoding("utf8");
    response.on("data", chunk => { body += chunk; });
    response.on("end", () => resolve({ status: response.statusCode, body }));
  });
  request.on("error", reject);
  request.end(payload);
});

console.log(`已向百度提交 ${urls.length} 个网址。`);
console.log(`HTTP ${result.status}: ${result.body}`);
if (!result.status || result.status >= 400) process.exitCode = 1;
