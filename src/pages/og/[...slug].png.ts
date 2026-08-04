import { getCollection } from "astro:content";
import { Resvg } from "@resvg/resvg-js";
import { SITE } from "@/config";
import type { APIRoute, GetStaticPaths } from "astro";

type OgProps = { title: string; description: string };

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return [
    { params: { slug: "home" }, props: { title: SITE.title, description: SITE.description } },
    ...posts.map(post => ({
      params: { slug: post.id },
      props: { title: post.data.title, description: post.data.description ?? `echo 的文章：${post.data.title}` }
    }))
  ];
};

const entities: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" };
const escapeXml = (value: string) => value.replace(/[<>&'"]/g, char => entities[char]);

export const GET: APIRoute<OgProps> = ({ props }) => {
  const title = escapeXml(props.title);
  const description = escapeXml(props.description);
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#0a0c0f"/>
      <rect x="0" y="0" width="18" height="630" fill="#83e1b1"/>
      <path d="M78 98H1122M78 526H1122" stroke="#313741" stroke-width="2"/>
      <text x="78" y="72" fill="#83e1b1" font-size="26" font-family="sans-serif" font-weight="700" letter-spacing="4">ECHO / DEV LOG</text>
      <text x="78" y="235" fill="#f2f4f7" font-size="72" font-family="serif" font-weight="700">${title.slice(0, 24)}</text>
      <text x="78" y="315" fill="#f2f4f7" font-size="72" font-family="serif" font-weight="700">${title.slice(24, 48)}</text>
      <text x="78" y="415" fill="#9ba3ae" font-size="28" font-family="sans-serif">${description.slice(0, 58)}</text>
      <text x="78" y="486" fill="#f2f4f7" font-size="24" font-family="monospace">github.com/cyb101003</text>
      <circle cx="1072" cy="476" r="50" fill="#83e1b1"/>
      <text x="1043" y="489" fill="#0a0c0f" font-size="32" font-family="monospace" font-weight="700">15</text>
    </svg>`;
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" } });
};
