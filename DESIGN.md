---
version: alpha
name: Haeward
description: Quiet personal editorial Astro blog with narrow reading, stone surfaces, serif prose, compact content lists, media grids, search, and RSS.
colors:
  surface: stone-100
  surface-dark: stone-900
  header-surface: stone-100/85
  header-surface-dark: stone-900/25
  text-primary: black/95
  text-primary-dark: white/90
  text-strong: black
  text-strong-dark: white
  text-muted: black/40-75
  text-muted-dark: white/38-74
  hairline: black/5-12
  hairline-dark: white/7-18
  link: sky-700
  link-dark: sky-300
  link-hover: sky-800
  link-hover-dark: sky-200
  focus: cyan-500/70
  quote: orange-400/85
  quote-dark: orange-500/85
  rating: amber-300
  rating-dark: amber-200
  success: emerald-500
  danger: rose-500
  toc-progress: "#c67c5a"
typography:
  ui:
    family: Noto Sans
    implementation: Tailwind font-sans
  reading:
    family: Noto Serif
    implementation: Tailwind font-serif, .serif-reading-surface, .serif-reading-title
  reading-zh:
    family: Noto Serif SC
    implementation: :lang(zh)
  reading-ja:
    family: Noto Serif JP
    implementation: :lang(ja)
  mono:
    family: JetBrains Mono
    implementation: Tailwind font-mono
  article-body:
    size: 1.04rem-1.06rem
    line-height: leading-8
  page-title:
    size: text-3xl sm:text-4xl
    weight: font-bold
  card-title:
    size: 0.84rem-1.14rem
    weight: font-semibold
spacing:
  container: max-w-screen-md
  page-gutter: px-5
  main-y: py-12 sm:py-16
  article-shell: max-w-screen-md
  dense-list-gap: gap-1
  link-grid-gap: gap-x-4 gap-y-3.5
  media-grid-gap: gap-4 sm:gap-6
rounded:
  small: rounded rounded-sm rounded-md
  card: rounded-lg
  search: 1.5rem desktop, 1.15rem mobile
  full: rounded-full
components:
  article-link:
    color: link
    color-dark: link-dark
    focus: visible outline from LinkEnhancer
  header-action:
    size: size-6
    shape: full
    focus: focus
  card:
    shape: card
    border: hairline
    shadow: shadow-sm
  media-card:
    shape: card
    ratio: aspect-[2/3]
    accent: rating
  search-panel:
    shape: search
    width: min(calc(100vw - 1.8rem), 48rem)
    backdrop: blur
  rss-preview:
    stylesheet: /feed/pretty-feed.xsl
    palette: standalone warm yellow preview
---

# Haeward Design System

> Agent-consumable design specification for this Astro personal blog.
> Source of truth: `src/styles/global.css`, `tailwind.config.mjs`,
> `src/layouts/PageLayout.astro`, `src/components/*.astro`,
> `src/pages/*.astro`, and `public/feed/pretty-feed.xsl`.

This document describes the current design. It is not a redesign proposal and
must not override the implementation. If a rule here conflicts with code, inspect
the code first and update the docs or implementation together.

Detailed rules live in:

- [Foundation](docs/design/foundation.md): expands the frontmatter values with
  current color, typography, layout, depth, motion, and breakpoint rationale.
- [Reading](docs/design/reading.md): article shell, prose, figures, lightbox,
  and TOC.
- [Components](docs/design/components.md): header, search, lists, cards, media,
  changelog, footer controls.
- [RSS](docs/design/rss.md): `/rss.xml` and `pretty-feed.xsl`.

## 1. Overview

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

## 2. Consumer Behavior

Agents and tools should read this document in two layers:

- Treat the YAML frontmatter as normative for current visual values and existing
  component mappings.
- Treat the Markdown sections as application guidance, rationale, and
  project-specific constraints.
- Preserve unknown or project-specific sections when transforming the document.
- Do not assume frontmatter values exist as CSS variables or runtime tokens.
- If frontmatter, prose, and implementation disagree, inspect the source files
  first and update the docs or code together.

## 3. Colors

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
| Status accents | `emerald-500`, `rose-500` | Link status dots. |
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

## 4. Typography

| Role | Current implementation | Typical use |
| --- | --- | --- |
| UI sans | `Noto Sans`, Tailwind `font-sans` | Header, nav, controls, metadata. |
| Reading serif | `Noto Serif`, Tailwind `font-serif` | Articles, page titles, content labels. |
| Chinese serif | `Noto Serif SC` via `:lang(zh)` | Chinese text in reading surfaces. |
| Japanese serif | `Noto Serif JP` via `:lang(ja)` | Japanese text in reading surfaces. |
| Mono | `JetBrains Mono`, Tailwind `font-mono` | Code, year progress, changelog dates. |

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

## 5. Layout

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

## 6. Elevation And Depth

| Role | Current implementation |
| --- | --- |
| Default depth | `shadow-sm`, `ring-1`, low-opacity border. |
| Card border | `black/5-12`, `white/7-18`. |
| Hover lift | `-translate-y-px`, `-translate-y-0.5`, `-translate-y-1`. |
| Search panel | Low-opacity border plus layered modal shadow. |
| RSS preview | Standalone hard shadow in `pretty-feed.xsl`. |

Do not introduce new default elevation levels for ordinary pages. Heavier shadow
belongs only to existing cover-heavy media cards and the RSS preview.

## 7. Shapes

| Role | Current implementation |
| --- | --- |
| Default card radius | `rounded-lg`. |
| Compact inline radius | `rounded`, `rounded-md`, `rounded-sm`. |
| Modal radius | Search panel uses `1.5rem`, mobile `1.15rem`. |
| Figure radius | `rounded-lg`. |
| Icon button radius | `rounded-full` for header actions. |
| Back-to-top radius | `rounded-lg`, not circular. |

Do not add large pill-like surfaces to normal content sections.

## 8. Components

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

## 9. Page Patterns

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

## 10. Do And Don’t

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

## 11. Responsive And Accessibility

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

## 12. Agent Prompt Guide

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

## 13. Validation

- Markdown-only documentation changes: `pnpm run md:lint`.
- Code/UI changes: `pnpm run check` and `pnpm run build:site`.
- UI, route, RSS, media, links, search, theme, article, or smoke-hook changes:
  `pnpm run smoke`.
