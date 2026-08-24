import type { APIRoute } from "astro";
import { SITE } from "@/config";

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL(SITE.url);
  const sitemap = new URL("sitemap.xml", base).href;
  return new Response(`User-agent: Baiduspider\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
};
