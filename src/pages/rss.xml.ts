import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@consts";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";

type Context = {
  site: string
}

export async function GET(context: Context) {
  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const blog = (await getCollection("blog")).filter(post => !post.data.draft);

  const posts = [...blog]
    .sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());

  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await post.render();
      const html = await container.renderToString(Content);

      return {
        title: post.data.title,
        description: post.data.description,
        content: html,
        pubDate: post.data.date,
        link: `/${post.collection}/${post.slug}/`,
      };
    })
  );

  return rss({
    title: SITE.NAME,
    description: SITE.DESC,
    site: context.site,
    items: items,

    customData: `
      <follow_challenge>
        <feedId>136093735733238784</feedId>
        <userId>55205286935703552</userId>
      </follow_challenge>
    `,
  });
}
