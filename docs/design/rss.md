# RSS

This file documents the feed route and its browser preview.

Primary sources:

- `src/pages/rss.xml.ts`
- `public/feed/pretty-feed.xsl`
- `src/components/Head.astro`
- `src/components/Footer.astro`

## Role

`/rss.xml` serves two audiences:

- feed readers that consume the XML directly
- people who open the feed URL in a browser and need a clear preview

Those are related but different surfaces. The XML must stay stable. The browser
preview may be expressive as long as it stays self-contained.

## Feed Route

The RSS route is not a normal page shell.

Current rules:

- route: `src/pages/rss.xml.ts`
- generated through `@astrojs/rss`
- source items come only from published blog posts
- items are newest first
- item content renders the full post body to HTML
- item links use the canonical post path
- feed advertises `/feed/pretty-feed.xsl` as its stylesheet
- Atom self link remains present

Do not casually change:

- feed URL
- item ordering
- item URL shape
- full-content behavior

## Discovery

RSS stays discoverable in two places:

- `Head.astro` adds the alternate feed link
- `Footer.astro` exposes a visible `RSS` text link

RSS is a utility destination, not a header-nav section.

## Browser Preview

The preview in `public/feed/pretty-feed.xsl` is intentionally outside the normal
site design language.

Normal site:

- warm paper
- quiet clay accents
- low-noise shell

RSS preview:

- bright yellow background
- patterned backdrop
- thick dark border
- hard shadow
- playful copy box
- red links

That contrast is intentional. The preview is an explanatory wrapper around raw
XML, not part of the day-to-day browsing shell.

## Preview Typography and Layout

Current preview typography:

- readable/display face: `LXGW Neo XiHei`
- utility text: `JetBrains Mono`

Current layout:

- `.page` max width `44rem`
- masthead with back link and explanation
- hero-like panel for title and feed URL copy
- second panel for recent items
- mobile adjustments at `max-width: 720px`

The preview should answer three questions quickly:

1. What is this?
2. What URL do I copy?
3. What recent posts are here?

## Copy Interaction

The feed URL copy control is a real button inside the XSL.

Current behavior:

- value stored in `data-copy`
- browser URL can hydrate the final copy value
- `navigator.clipboard.writeText` when available
- temporary-input fallback when needed
- temporary copied state after success
- visible focus outline

Keep this interaction dependency-free and local to the XSL.

## Constraints

- do not import Tailwind into the XSL preview
- do not try to reuse the normal site header or search modal
- do not add client-side routing behavior
- do not turn the preview into a full article archive

## Validation

Docs-only work: `pnpm run md:lint`

RSS implementation work:

- `pnpm run build:site`
- `pnpm run smoke` when feed behavior or preview behavior changes
- verify `/rss.xml` stays reachable and newest-first
