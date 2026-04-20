import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { SITE } from "@consts";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";

export async function GET(context: APIContext) {
  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const siteUrl = context.site ?? new URL(context.request.url).origin;
  const feedUrl = new URL("/rss.xml", siteUrl).href;

  const blog = (await getCollection("blog")).filter(post => !post.data.draft);

  const posts = [...blog]
    .sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());

  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      const html = await container.renderToString(Content);

      return {
        title: post.data.title,
        description: post.data.description,
        content: html,
        pubDate: post.data.date,
        link: `/${post.collection}/${post.id}/`,
      };
    })
  );

  return rss({
    title: SITE.NAME,
    description: SITE.DESC,
    site: siteUrl,
    items: items,
    stylesheet: "/pretty-feed.xsl",
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },

    customData: `
      <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
      <follow_challenge>
        <feedId>136093735733238784</feedId>
        <userId>55205286935703552</userId>
      </follow_challenge>
    `,
  });
}
