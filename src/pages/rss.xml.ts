import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@consts";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

const parser = new MarkdownIt();

type Context = {
  site: string
}

export async function GET(context: Context) {
  const blog = (await getCollection("blog")).filter(post => !post.data.draft);

  const items = [...blog]
    .sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());

  return rss({
    title: SITE.NAME,
    description: SITE.DESC,
    site: context.site,
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.description,
      content: sanitizeHtml(parser.render(item.body)),
      pubDate: item.data.date,
      link: `/${item.collection}/${item.slug}/`,
    })),

    customData: `
      <follow_challenge>
        <feedId>136093735733238784</feedId>
        <userId>55205286935703552</userId>
      </follow_challenge>
    `,
  });
}
