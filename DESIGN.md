# Haeward Design System

> Agent-consumable design specification for this Astro personal blog.
> Source of truth: `src/styles/global.css`, `tailwind.config.mjs`,
> `src/layouts/PageLayout.astro`, `src/components/*.astro`,
> `src/pages/*.astro`, and `public/feed/pretty-feed.xsl`.

This document describes the current design. It is not a redesign proposal and
must not override the implementation. If a rule here conflicts with code, inspect
the code first and update the docs or implementation together.

Detailed rules live in:

- [Foundation](docs/design/foundation.md): color, typography, layout, depth, motion.
- [Reading](docs/design/reading.md): article shell, prose, figures, TOC.
- [Components](docs/design/components.md): header, search, lists, cards, media,
  changelog, footer controls.
- [RSS](docs/design/rss.md): `/rss.xml` and `pretty-feed.xsl`.

## 1. Visual Theme And Atmosphere

| Attribute | Current rule |
| --- | --- |
| Style | Quiet personal editorial blog, not a product site or dashboard. |
| Personality | Content-first, narrow reading, low-chroma surfaces, restrained motion. |
| Canvas | Stone light/dark background: `bg-stone-100`, `dark:bg-stone-900`. |
| Voice | Serif content titles and prose; sans UI; mono dates/code. |
| Primary width | `max-w-screen-md` with `px-5`. |
| Interaction | Small color changes, arrow reveals, subtle lifts, visible focus. |

The design should make writing, reading, links, and media logs feel calm and
direct. The interface should not ask for attention unless it is helping the user
read, navigate, search, copy, or open something.

Use these principles:

- Content is the visual center. Avoid decorative wrappers around page sections.
- Stone backgrounds and opacity-based text colors define the base atmosphere.
- Images and media covers may provide color; UI chrome should stay quiet.
- Motion should clarify state or direction, never decorate the page.
- Dark mode should preserve the same hierarchy, not create a separate theme.

## 2. Color Palette And Roles

These are foundation values documented from current Tailwind/CSS usage. They are
not a code token system or CSS variables.

### Light Theme

| Role | Current value | Use |
| --- | --- | --- |
| Page background | `stone-100` | Body, header base, article meta row. |
| Primary text | `black/95` | Body default. |
| Strong text | `black`, `black/96` | Headings, active states. |
| Body prose | `black/85` | Article paragraphs. |
| Muted text | `black/40` to `black/75` | Dates, metadata, hints. |
| Hairline | `black/5` to `black/12` | Cards, dividers, rings. |
| Article link | `sky-700` | Links inside prose. |
| Focus accent | `cyan-500/70` | Header actions and key controls. |
| Quote accent | `orange-400/85`, `orange-100` | Blockquotes. |
| Rating accent | `amber-300` | Media stars. |
| Success status | `emerald-500` | Reachable link status. |
| Failure status | `rose-500` | Unreachable link status. |
| TOC progress | `#c67c5a` | Article reading progress. |

### Dark Theme

| Role | Current value | Use |
| --- | --- | --- |
| Page background | `stone-900` | Body and article meta row. |
| Primary text | `white/90` | Body default. |
| Strong text | `white`, `white/95` | Headings, active states. |
| Body prose | `white/85` | Article paragraphs. |
| Muted text | `white/38` to `white/74` | Dates, metadata, hints. |
| Hairline | `white/7` to `white/18` | Cards, dividers, rings. |
| Article link | `sky-300` | Links inside prose. |
| Focus accent | `cyan-500/70`, `white/20` | Controls and dark focus rings. |
| Quote accent | `orange-500/85`, `orange-200` | Blockquotes. |
| Rating accent | `amber-200` | Media stars. |
| Search surface | Stone/zinc gradients | Search modal panel. |

Do not add a new dominant hue family. New colors need a semantic role and must
not overpower the stone canvas.

## 3. Typography Rules

| Role | Current implementation | Typical use |
| --- | --- | --- |
| UI sans | `Noto Sans`, Tailwind `font-sans` | Header, nav, controls, metadata. |
| Reading serif | `Noto Serif`, Tailwind `font-serif` | Articles, page titles, content labels. |
| Chinese serif | `Noto Serif SC` via `:lang(zh)` | Chinese text in reading surfaces. |
| Japanese serif | `Noto Serif JP` via `:lang(ja)` | Japanese text in reading surfaces. |
| Mono | `JetBrains Mono`, Tailwind `font-mono` | Code, year progress, changelog dates. |

### Type Scale

| Element | Size | Weight | Notes |
| --- | --- | --- | --- |
| Article body | `1.04rem` | inherited | `leading-8`, serif. |
| Article paragraph | `1.06rem` | `font-medium` | `tracking-[0.014em]`. |
| Article list item | `1.04rem` | `font-medium` | `tracking-[0.012em]`. |
| Article title | `text-xl sm:text-2xl` | `font-bold` | Serif reading title. |
| Page title | `text-3xl sm:text-4xl` | `font-bold` | Links, Changelog. |
| Section title | `text-xl sm:text-2xl` | `font-bold` | Link sections. |
| ArrowCard title | `1.08rem sm:1.14rem` | `font-semibold` | Post lists. |
| LinkCard title | `0.84rem` | `font-semibold` | Compact external link cards. |
| MediaCard title | `11px sm:text-xs` | `font-semibold` | Poster cards, two-line clamp. |

Rules:

- Use `.serif-reading-title` for content titles.
- Use `.serif-reading-surface` for long-form reading surfaces.
- Preserve `lang` and `data-language-scan` on mixed-language content.
- Do not use viewport-width font scaling.
- Keep letter spacing non-negative.

## 4. Layout Principles

| Pattern | Current rule |
| --- | --- |
| Page shell | `PageLayout` renders header, `main`, search modal, footer, back-to-top. |
| Content container | `Container`: `mx-auto max-w-screen-md px-5`. |
| Main spacing | `main` uses `py-12 sm:py-16` and layout top offset `mt-14 sm:mt-8`. |
| Article shell | `.blog-post-shell`: `relative mx-auto max-w-screen-md`. |
| Vertical rhythm | `space-y-8`, `space-y-10`, `space-y-12`, `sm:space-y-12`. |
| Header width | Header inner content aligns to `max-w-screen-md`. |
| Dense grids | Link and media pages use grids only where scanning benefits from them. |

Do not add full-width bands or hero sections unless a real content need appears.
The site’s default shape is centered, narrow, and text-led.

## 5. Component Styling

| Need | Use |
| --- | --- |
| Generic page link | `Link.astro`, current color, optional underline. |
| Article link | Bold sky link from global prose styles plus `LinkEnhancer`. |
| Global icon action | `.header-action`, `size-6`, round, cyan focus ring. |
| Post list row | `ArrowCard`, serif title, date, animated arrow. |
| External link card | `LinkCard`, compact favicon/title/meta/status surface. |
| Poster card | `MediaCard`, `aspect-[2/3]`, cover, title, amber rating. |
| Search surface | `SearchModal`, full-screen overlay, blurred backdrop, panel. |
| Reading TOC | `TableOfContents`, desktop rail at `xl`, progress indicator. |
| Back-to-top | Fixed `size-12` rounded square with arrow reveal. |
| RSS preview | `pretty-feed.xsl`, self-contained XSL browser aid. |

Component rules:

- Cards use `rounded-lg`, low-opacity borders/rings, and `shadow-sm`.
- Avoid nested card surfaces.
- Icon-only controls must have `aria-label`.
- Existing `data-*` hooks are part of the interaction contract.
- Search, tabs, lightbox, and TOC have semantic or state attributes that must be
  preserved.

## 6. Depth, Radius, And Motion

| Role | Current implementation |
| --- | --- |
| Default card radius | `rounded-lg`. |
| Compact inline radius | `rounded`, `rounded-md`, `rounded-sm`. |
| Modal radius | Search panel uses `1.5rem`, mobile `1.15rem`. |
| Figure radius | `rounded-lg`. |
| Default depth | `shadow-sm`, `ring-1`, low-opacity border. |
| Hover lift | `-translate-y-px`, `-translate-y-0.5`, `-translate-y-1`. |
| Reveal motion | `.animate`: `opacity-0 translate-y-3` to visible, `700ms ease-out`. |
| Stagger | Global script adds `.show` with `150ms` incremental delay. |
| Direction cue | Arrow line/chevron transforms in `ArrowCard` and back-to-top. |

Motion is allowed when it communicates direction, activation, or loading. Avoid
looping decorative movement.

## 7. Page Patterns

| Page | Design rule |
| --- | --- |
| Home | Sparse introduction: programmer SVG, social icons, latest posts. No hero copy. |
| Blog archive | Year groups plus `ArrowCard` rows. No thumbnails or summaries. |
| Article | Title/meta, prose, optional previous/next, desktop TOC rail. |
| Links | Serif intro, sectioned compact link-card grids. |
| Media | Tabs for content categories, poster grids, explicit load-more. |
| About | Plain reading surface inside `Container`. |
| Changelog | Eyebrow, serif title, year/date grid. No cards. |
| RSS | Machine-readable feed with a standalone XSL subscription preview. |

## 8. Do And Don’t

### Do

- Use the existing Tailwind utilities and CSS selectors as the design source.
- Keep normal pages inside `Container` or an intentional equivalent.
- Keep body text readable before adding visual treatment.
- Use visible focus states for every interactive element.
- Preserve light/dark parity for text, surfaces, borders, and controls.
- Use the existing three-state theme model: `system -> light -> dark`.
- Keep RSS stable at `/rss.xml` and preserve feed discovery.
- Update this documentation when changing design behavior.

### Don’t

- Don’t introduce a token system in code without an explicit refactor.
- Don’t add dependencies for visual styling alone.
- Don’t create marketing-style hero sections for this blog.
- Don’t turn article bodies, archives, or changelog rows into heavy cards.
- Don’t add a new color palette around a section.
- Don’t remove `data-*` hooks used by scripts or smoke tests.
- Don’t hand-edit generated link enrichment, link assets, Douban data, or Douban
  covers during design work.

## 9. Responsive And Accessibility Rules

| Area | Required behavior |
| --- | --- |
| Header | Wraps on small screens, becomes horizontal at `sm`. |
| Links | Grid moves from one to two to three columns. |
| Media | Grid starts at two columns, expands at wider breakpoints. |
| Search | Mobile hides desktop `ESC` button and stacks footer hints. |
| Article TOC | Desktop rail only at `xl`; never crowd mobile reading. |
| Focus | Use `focus-visible` rings/outlines; do not suppress focus generally. |
| Semantics | Keep dialog, tablist, status, and screen-reader labels intact. |
| Images | Meaningful images need useful alt text; decorative adjacent icons can be empty. |

## 10. Agent Prompt Guide

When generating UI for this project, use these mappings:

```text
Page background      -> stone-100 / dark:stone-900
Primary text         -> black/95 / dark:white/90
Muted text           -> black or white with 40-75 opacity
Reading title        -> .serif-reading-title
Reading surface      -> .serif-reading-surface
Article link         -> sky-700 / dark:sky-300
Focus accent         -> cyan focus ring
Card surface         -> rounded-lg + low-opacity border/ring + shadow-sm
Primary container    -> max-w-screen-md px-5
Motion               -> color/opacity/arrow/translate only
```

Before adding a new pattern, choose from the existing surfaces:

| If you need | Start from |
| --- | --- |
| A post row | `ArrowCard`. |
| An external reference | `LinkCard`. |
| A visual cover item | `MediaCard`. |
| A global command surface | `SearchModal`. |
| A long reading page | Article/prose rules in [Reading](docs/design/reading.md). |
| A feed-related change | [RSS](docs/design/rss.md). |

Validation:

- Markdown-only documentation changes: `pnpm run md:lint`.
- Code/UI changes: `pnpm run check` and `pnpm run build:site`.
- UI, route, RSS, media, links, search, theme, article, or smoke-hook changes:
  `pnpm run smoke`.
