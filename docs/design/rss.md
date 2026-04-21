# RSS

This document defines the design rules for the RSS route. The main
implementation lives in `src/pages/rss.xml.ts`, `public/feed/pretty-feed.xsl`,
`src/components/Head.astro`, `src/components/Footer.astro`,
`scripts/verify/smoke.mjs`, and `astro.config.mjs`.

## Role

`/rss.xml` is a content distribution surface. Its primary audience is feed
readers; its secondary audience is a person who opens the feed directly in a
browser.

Design priorities:

- Keep the XML feed stable and standards-friendly.
- Include enough article content for comfortable reading in feed readers.
- Make direct browser visits understandable through the XSL preview.
- Preserve feed discovery from every HTML page.
- Avoid changing feed URLs, item URLs, or ordering casually.

Do not treat RSS as a normal Astro page. It should not share the site header,
client-side navigation, search modal, or global page shell.

## Feed Route

The route is `src/pages/rss.xml.ts`.

Current behavior:

- `GET` returns RSS using `@astrojs/rss`.
- `siteUrl` comes from `context.site`, falling back to the request origin.
- `feedUrl` is always derived as `/rss.xml` from `siteUrl`.
- Blog posts come from the `blog` content collection.
- Draft posts are excluded.
- Items are sorted newest-first by `post.data.date`.
- Each item renders the full Markdown/MDX body to HTML through
  `AstroContainer`.
- Item links use `/${post.collection}/${post.id}/`.
- Feed title and description come from `SITE.NAME` and `SITE.DESC`.
- The feed references `/feed/pretty-feed.xsl` as its stylesheet.
- The feed declares the Atom namespace and emits an Atom self link.
- The feed includes the current `follow_challenge` custom data.

Do not strip full item content unless the product decision is explicitly to make
RSS excerpt-only. The current design favors reading posts inside a feed reader.

## Feed Content Rules

Each RSS item should map directly to one published blog post.

Use:

- `post.data.title` as the item title.
- `post.data.description` as the item description.
- Rendered post HTML as item content.
- `post.data.date` as `pubDate`.
- The canonical blog path as item link.

Avoid:

- Adding draft posts.
- Adding non-blog pages.
- Changing item order away from newest-first.
- Adding UI-only content that makes sense only inside the website shell.
- Injecting client-side scripts into item content.

If article rendering changes, check the feed output too. RSS consumes the same
Markdown/MDX content, but the reading environment is a feed reader rather than
the site prose shell.

## Discovery

RSS must remain discoverable in two places:

- `Head.astro` includes an alternate link:
  `rel="alternate"`, `type="application/rss+xml"`, title from `SITE.NAME`, and
  href resolved from `Astro.site`.
- `Footer.astro` includes a visible `RSS` link to `/rss.xml`.

The footer RSS link uses the existing footer link style: bold, cyan, and
underlined. Do not move RSS into the main header nav unless the overall
navigation model changes; the feed is a utility destination, not a primary
section like Archive or Media.

## Pretty Feed Preview

`public/feed/pretty-feed.xsl` is the browser preview for `/rss.xml`.

This preview intentionally has a different visual personality from the main
site. It is more playful and high-contrast, with a yellow patterned background,
outlined panels, chunky borders, and copy-focused controls. That difference is
acceptable because the preview is an educational wrapper around raw feed XML,
not a normal site page.

Current preview identity:

- Background base: warm yellow `#FFC34A`.
- Pattern: subtle diagonal/repeating line texture.
- Panels: cream/off-white, thick dark border, large radius, hard shadow.
- Type: `Noto Sans` for text, `JetBrains Mono` for labels and utility text.
- Accent: red links and copy status.
- Feed address control: large button-like copy box with ellipsis overflow.
- Recent items: simple ordered list with title links and mono dates.

Keep the preview self-contained inside the XSL. It should not depend on
Tailwind, Astro components, or site client scripts.

## Preview Layout

The XSL preview uses:

- `.page` capped at `44rem`.
- Top spacing through `padding: 2rem 1rem 3rem`.
- A masthead with back link and short explanation of what an RSS feed is.
- A hero panel for feed title and feed address copy.
- A second panel for recent items.
- Mobile adjustments at `max-width: 720px`.

The preview should answer three questions quickly:

1. What is this page?
2. What URL should I copy into a feed reader?
3. What recent posts are in this feed?

Do not add a full article list with excerpts to the preview. Feed readers handle
reading; the browser preview should stay a subscription aid.

## Copy Interaction

The feed address box is a button.

Rules:

- It stores the copy value in `data-copy`.
- It hydrates from the browser URL when possible.
- It copies with `navigator.clipboard.writeText` when available.
- It falls back to a temporary input and `document.execCommand("copy")`.
- It shows the `Copied` state for about `1800ms`.
- It has a visible focus outline.

Do not add dependencies for this interaction. The current script is deliberately
small and self-contained.

## Links And Metadata

The preview back link points to `/` after hydration. The displayed host comes
from `window.location.host` when available, with an XSL fallback from the channel
link.

Recent item links come directly from each RSS item `link`. Do not rewrite them
to client-side routes or add Astro transition behavior.

The Atom self link must continue to point at the absolute feed URL. Feed readers
use it to identify the canonical feed.

## Accessibility

The browser preview should remain usable without site JavaScript.

Rules:

- The feed copy control is a real `button`.
- Focus is visible with a thick outline.
- Link text is descriptive enough to understand destination.
- The feed address is visible as text even if copy fails.
- The layout reflows at small widths.
- The page uses `lang="en"`.

The XSL preview is not required to support dark mode. Because it is outside the
main site shell, keep its high-contrast standalone palette instead of trying to
mirror `stone-100` and `stone-900`.

## Testing

For documentation-only changes, `pnpm run md:lint` is enough.

For RSS implementation changes:

- Run `pnpm run build:site` to validate the route.
- Run `pnpm run smoke` when the route, footer RSS link, head alternate link, or
  XSL preview changes.
- Confirm `/rss.xml` returns `200`; the smoke test already checks this.
- Inspect the generated feed for newest-first ordering and no draft posts.

Do not update generated data as part of RSS design changes.
