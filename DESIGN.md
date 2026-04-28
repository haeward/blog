# Design System

Design guide for the current Astro blog. This is a description of the
implemented design, not a redesign brief.

Detailed topic docs:

- [Design YAML](docs/design/design.yaml)
- [Foundation](docs/design/foundation.md)
- [Reading](docs/design/reading.md)
- [Components](docs/design/components.md)
- [RSS](docs/design/rss.md)

## 1. Overview

This site is a personal editorial blog. It should read like a calm notebook,
not a product landing page, dashboard, or marketing surface.

The visual center is always the content column. The shell stays warm, quiet, and
slightly tactile: paper-like background, low-noise text colors, compact chrome,
and small motion that explains interaction without competing with the writing.

Three traits define the current implementation:

- warm paper canvas instead of pure white
- narrow reading width instead of wide magazine layouts
- restrained interaction instead of expressive UI chrome

## 2. Consumer Behavior

Read this document in two layers:

- `docs/design/design.yaml` is the canonical structured summary of current
  visual values.
- Markdown sections explain how those values are applied in this repo.

Rules for agents:

- preserve unknown sections rather than normalizing them away
- inspect implementation when prose and code disagree
- treat `src/styles/global.css` as the source of truth for repeated colors,
  focus, link behavior, and modal surfaces
- do not infer a CSS token framework from this document; the project uses
  lightweight CSS variables plus Tailwind utilities

## 3. Design Principles

1. Content first. The shell should support reading, sorting, searching, and
   browsing, not become the main event.
2. Warm restraint. The page background, borders, and text colors should stay in
   one warm family. Color appears mostly in links, quotes, ratings, status dots,
   and RSS preview.
3. Stable width. Most pages stay within `max-w-screen-md`; readability is a
   product decision here, not an incidental utility class.
4. Small motion. Hover, reveal, and dialog motion should clarify state or
   direction. Nothing should pulse, loop, or perform for decoration.
5. Same hierarchy in both themes. Dark mode keeps the same relationships, not a
   different personality.

## 4. Colors

The normal site palette is warm paper plus warm clay accents.

- Page canvas: `#efeee9` in light mode, `stone-900` in dark mode
- Text system: `--site-color-text-primary`, `--site-color-text-heading`,
  `--site-color-text-body`, `--site-color-text-muted`
- Borders and rings: `--site-color-surface-border`,
  `--site-color-surface-border-strong`
- Link system: `--site-link-*` variables for internal, external, hover,
  decoration, and focus states
- Reading accents: orange blockquotes, amber ratings, emerald/rose status dots

The RSS preview is the only deliberate palette exception. It uses a bold yellow
and red browser-preview language inside `public/feed/pretty-feed.xsl`.

## 5. Typography

The current site is no longer a serif-first implementation. The readable face
used by `.serif-reading-surface` and `.serif-reading-title` is
`LXGW Neo XiHei`. The class names are historical and should not be treated as a
promise of serif typography.

Active type roles:

- UI shell: `font-sans` / system UI
- Reading and titles: `LXGW Neo XiHei`
- Code and utility text: `JetBrains Mono`

Current scale anchors:

- page title: `text-3xl sm:text-4xl`
- post title: `text-xl sm:text-2xl`
- prose body: `1.04rem` to `1.06rem`, `leading-8`
- dense card titles: `0.89rem` to `1.16rem`
- micro metadata: `0.7rem` to `0.88rem`

## 6. Layout

The layout is intentionally repetitive:

- global page shell uses `px-5`
- content width usually resolves to `max-w-screen-md`
- `main` uses `py-12 sm:py-16`
- article pages keep title, meta, body, navigation, and optional TOC inside one
  narrow reading frame
- compact grids are used only for links and media

Do not introduce wide framed sections, nested page cards, or decorative hero
bands without changing the product model.

## 7. Motion

Motion is present but quiet:

- `.animate` reveal: `duration-700 ease-out`
- normal hover/focus transitions: about `200ms` to `300ms`
- lightbox and search: slightly faster dialog motion
- hover motion is usually one of:
  - color change
  - `translateY(-1px)`
  - short directional arrow movement

Avoid looping motion, exaggerated bounces, and large shadow jumps.

## 8. Components

The recurring building blocks are:

- fixed translucent header with theme toggle and search trigger
- custom search modal with Pagefind-backed results
- `ArrowCard` for post lists
- `LinkCard` for compact outbound references
- `MediaCard` for poster-first media items
- article TOC, image lightbox, and previous/next links
- footer utility links and back-to-top control

All of them should feel like thin wrappers around content, not decorative
objects.

## 9. Page Patterns

Current page patterns:

- Home: compact post list and restrained overview surfaces
- Archive: year-grouped post index with dense `ArrowCard` rows
- Article: narrow reading shell with optional TOC and image zoom
- Links: sectioned reference directory with compact cards
- Media: tabbed poster grid with sentinel-based loading
- About / utility content pages: same reading width, no special landing-page
  chrome
- Changelog: date/content chronology, not card feed
- RSS preview: standalone browser aid, not part of the normal shell

## 10. Quick Reference

| Need | Use |
| --- | --- |
| New page shell | `px-5` + `max-w-screen-md` before inventing a custom width |
| New text link | Warm clay link roles from `--site-link-*` |
| New compact card | `rounded-lg`, subtle border/ring, low-noise background |
| New utility action | icon or text-only control with visible focus |
| New content list item | start from `ArrowCard` density, not from a marketing card |
| New media surface | let cover art provide color; keep shell neutral |
| New reading feature | add it around the article, not as a framed hero block |

## 11. Anti-Patterns

Do not do these unless the design language intentionally changes:

- no pure-white page background
- no cool blue-gray neutral system
- no large floating cards around normal page sections
- no wide prose columns
- no extra article hero wrappers
- no bright secondary palette for normal site pages
- no hard, heavy shadows as the default depth language
- no decorative motion that does not clarify interaction
- no copying the RSS preview palette into normal pages

## 12. Accessibility And Responsive Rules

Accessibility is handled through concrete behavior, not slogans:

- focus states must remain visible on links, icon controls, cards, and dialogs
- keyboard search open/close must keep working
- TOC, search, and lightbox must preserve their current semantics
- line length must stay readable on desktop
- mobile should keep the same information order without relying on hover
- article anchors use `scroll-margin-top` to remain readable under the fixed
  header

## 13. Source Of Truth / Validation

Source of truth:

- `src/styles/global.css`
- `src/layouts/PageLayout.astro`
- `src/components/*.astro`
- `src/pages/*.astro`
- `src/lib/media-card.ts`
- `src/scripts/*.ts`
- `public/feed/pretty-feed.xsl`

Validation rules:

- if design docs conflict with code, fix the docs or code together
- docs-only updates should run `pnpm run md:lint`
- remove stale component/file references when structure changes
