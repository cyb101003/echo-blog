import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE } from "@/config";

const xmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;"
};

const escapeXml = (value: string) => value.replace(/[&<>"']/g, char => xmlEntities[char]);
type SitemapEntry = { path: string; lastmod?: string };

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(SITE.url);
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  const tags = [...new Set(posts.flatMap(post => post.data.tags))];
  const staticPaths = ["/", "/about/", "/projects/", "/projects/hackathon/", "/posts/", "/archives/", "/tags/"];
  const entries: SitemapEntry[] = [
    ...staticPaths.map(path => ({ path })),
    ...posts.map(post => ({ path: `/posts/${post.id}/`, lastmod: (post.data.updatedAt ?? post.data.publishedAt).toISOString() })),
    ...tags.map(tag => ({ path: `/tags/${encodeURIComponent(tag)}/` }))
  ];

  const body = entries
    .map(entry => {
      const location = escapeXml(new URL(entry.path, base).href);
      const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
      return `<url><loc>${location}</loc>${lastmod}</url>`;
    })
    .join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};
