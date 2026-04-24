# Links

This document defines the normal-site link color system. It applies to internal
and external links outside the Footer and Links page.

## Design Direction

Links use a Warm Clay palette so interactive text feels connected to the site's
warm paper, stone, and orange blockquote accents.

- Internal links rest on muted brown.
- External and mail links rest on warmer copper.
- Text links are not underlined by default.
- Hover and focus add a thinner underline and a restrained color shift.
- Decoration color is softer than text color to avoid noisy paragraphs.

Do not add external-link icons to prose links by default. External behavior is
handled through `target`, `rel`, and accessible labels.

## Implementation

The shared implementation lives in `src/styles/global.css`.

- `body` owns the `--site-link-*` CSS variables for light mode.
- `html.dark body` overrides the same variables for dark mode.
- `.site-link` is the reusable text-link class used by `Link.astro` and
  JavaScript-rendered links.
- `.site-prose-links` is the explicit scope for Markdown and prose surfaces such
  as post content, About, and the Now lists.
- `.site-link-surface`, `.site-ring-surface`, `.site-focus-ring`, and
  `.site-nav-link` cover card, ring, focus, and post-navigation surfaces.
- Prose links are styled through `.site-prose-links :where(a)` so they override
  Tailwind Typography at the same selector shape it uses for Markdown content.

`src/components/Link.astro` should be the default component for authored links.
Use `underline={true}` for text links that need the Warm Clay treatment. Use
`external={true}` for outbound links so the component adds the proper target,
rel, and data attributes.

## Scope

Included surfaces:

- Article and About prose links.
- Now page media links.
- Moments text links, Mastodon fallback links, preview cards, and quote cards.
- Search result card hover and focus border.
- Article table of contents progress and active states.
- Media card hover and focus ring.
- Previous/next article navigation.
- Header action focus rings and back-to-top focus ring.

Excluded surfaces:

- Footer links.
- Links page and `LinkCard` directory cards.
- RSS browser preview XSL.
- Generated link and Douban data.

## Accessibility

- Prose links reveal a thin underline on hover and focus.
- Text links use underline plus a restrained Warm Clay color shift on hover and
  focus.
- Focus states use the Warm Clay focus color and remain visible in both themes.
- High-contrast mode continues to force thicker underlines and current-color
  outlines in `LinkEnhancer.astro`.
- Reduced-motion mode still disables article link transitions.

## Color Roles

| Role | Light | Dark | Notes |
| --- | --- | --- | --- |
| Internal link | `#7d4b2f` | `#e6aa84` | Normal in-site text links. |
| Text internal hover | `#805033` | `#e8ae8a` | Prose and list text links on hover/focus. |
| Internal emphasis | `#5f3723` | `#ffd0af` | Active non-prose surfaces. |
| External link | `#9f542f` | `#f0b58f` | `http`, `https`, and `mailto`. |
| Text external hover | `#a25832` | `#f1b994` | Outbound prose and list text links on hover/focus. |
| External emphasis | `#7c3f23` | `#ffd7bc` | Active non-prose surfaces. |
| Link decoration | `rgba(200, 145, 107, 0.72)` | `rgba(158, 94, 61, 0.82)` | Internal underline. |
| External decoration | `rgba(214, 161, 124, 0.78)` | `rgba(176, 103, 67, 0.86)` | External underline. |
| Focus ring | `rgba(159, 84, 47, 0.48)` | `rgba(240, 181, 143, 0.5)` | Focus outlines/rings. |
| Focus fill | `rgba(159, 84, 47, 0.08)` | `rgba(240, 181, 143, 0.1)` | Subtle nav focus background. |
