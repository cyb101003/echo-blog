import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE } from "@/config";

export async function GET(context: APIContext) {
  const posts = (await getCollection("posts", ({ data }) => !data.draft)).sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description ?? `${SITE.author}的文章：${post.data.title}`,
      pubDate: post.data.publishedAt,
      link: `/posts/${post.id}/`,
      categories: post.data.tags
    })),
    customData: `<language>${SITE.locale}</language>`
  });
}
