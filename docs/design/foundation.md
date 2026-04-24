# Foundation

These are foundation values for the current design. They expand the compact
frontmatter in `DESIGN.md` with implementation notes and rationale. They
describe existing Tailwind utilities, CSS selectors, and custom CSS values; they
are not a separate code token system or CSS variable layer.

## Source Files

- `src/styles/global.css`
- `tailwind.config.mjs`
- `src/layouts/PageLayout.astro`
- `src/components/*.astro`
- `src/pages/*.astro`
- `public/feed/pretty-feed.xsl`
- `docs/design/links.md`

## Color Roles

### Base Palette

| Role | Light | Dark | Notes |
| --- | --- | --- | --- |
| Page canvas | `stone-100` | `stone-900` | Body and page background. |
| Header canvas | `stone-100/85` | `stone-900/25` | Fixed translucent header. |
| Primary text | `black/95` | `white/90` | Body default. |
| Strong text | `black`, `black/96` | `white`, `white/95` | Headings, active states. |
| Prose text | `black/85` | `white/85` | Article paragraphs. |
| List text | `black/84` | `white/84` | Article lists. |
| Muted text | `black/40` to `black/75` | `white/38` to `white/74` | Metadata and hints. |
| Hairline | `black/5` to `black/12` | `white/7` to `white/18` | Borders, rings, dividers. |
| Search panel | `stone`/`zinc` gradients | `stone`/dark gradients | Modal surface only. |

### Accent Roles

| Role | Light | Dark | Used by |
| --- | --- | --- | --- |
| Internal link | `#7d4b2f` | `#e6aa84` | In-site text links. |
| External link | `#9f542f` | `#f0b58f` | `http`, `https`, and `mailto` links. |
| Link emphasis | `#5f3723`, `#7c3f23` | `#ffd0af`, `#ffd7bc` | Active non-prose surfaces. |
| Focus | Warm Clay CSS variables | Warm Clay CSS variables | Header, buttons, search, prose. |
| Blockquote | `orange-400/85`, `orange-100` | `orange-500/85`, `neutral-500/10` | Quote border and fill. |
| Blockquote text | `orange-800` | `orange-200` | Quote content. |
| Code text | `red-600` | `red-400` | Inline code. |
| Rating | `amber-300` | `amber-200` | Media stars. |
| Link status up | `emerald-500` | `emerald-500` | LinkCard status dot. |
| Link status down | `rose-500` | `rose-500` | LinkCard status dot. |
| TOC progress | Warm Clay external link | Warm Clay external link | Article reading progress. |

### RSS Preview Palette

The RSS browser preview is intentionally standalone.

| Role | Value |
| --- | --- |
| Background | `#FFC34A` |
| Panel | `#fffdf7` |
| Cream | `#fff9ec` |
| Ink | `#19120f` |
| Muted | `#5e554d` |
| Line | `#231915` |
| Link red | `#cf3825` |
| Link red hover | `#a82618` |
| Coin yellow | `#ffc93c` |

Do not reuse the RSS preview palette in normal site pages.

## Typography

| Token | Implementation | Use |
| --- | --- | --- |
| `font-ui` | `Noto Sans`, Tailwind `font-sans` | Header, buttons, nav, labels. |
| `font-reading` | `Noto Serif`, Tailwind `font-serif` | Prose and content titles. |
| `font-reading-zh` | `Noto Serif SC` | Chinese readable text. |
| `font-reading-ja` | `Noto Serif JP` | Japanese readable text. |
| `font-code` | `JetBrains Mono`, Tailwind `font-mono` | Code, dates, progress. |

### Size Scale

| Token | Current value | Use |
| --- | --- | --- |
| `text-fine` | `0.66rem` to `0.78rem` | Link metadata, search dates. |
| `text-caption` | `text-xs`, `text-sm` | Dates, captions, footer. |
| `text-ui` | `text-sm sm:text-base` | Header nav, buttons. |
| `text-card-title` | `0.84rem` to `1.14rem` | Link and post cards. |
| `text-prose` | `1.04rem` to `1.06rem` | Article body. |
| `text-section` | `text-xl sm:text-2xl` | Section headings. |
| `text-page` | `text-3xl sm:text-4xl` | Directory page titles. |

### Line Height And Tracking

| Context | Line height | Tracking |
| --- | --- | --- |
| Article base | `leading-8` | default or positive. |
| Paragraphs | `leading-8` | `0.014em`. |
| List items | `leading-8` | `0.012em`. |
| Serif title | title-dependent | `0.012em` base class. |
| Search excerpt | `1.65` | default. |
| Captions | relaxed | default. |

Do not use negative letter spacing for this site.

## Layout

| Token | Current value | Use |
| --- | --- | --- |
| `container-main` | `max-w-screen-md px-5` | Normal page content. |
| `article-shell` | `max-w-screen-md` | Blog post wrapper. |
| `search-panel` | `min(calc(100vw - 1.8rem), 48rem)` | Search modal. |
| `rss-page` | `44rem` | RSS XSL preview. |
| `toc-rail` | `w-48`, fixed at `xl` | Article TOC. |
| `poster-ratio` | `aspect-[2/3]` | Media covers. |

### Spacing Scale In Use

| Value | Use |
| --- | --- |
| `px-5` | Page gutters. |
| `py-12 sm:py-16` | Main vertical page padding. |
| `space-y-8` | Simple content pages. |
| `space-y-10 sm:space-y-12` | Directory and changelog sections. |
| `gap-1` | Dense post lists. |
| `gap-x-4 gap-y-3.5` | Link grid. |
| `gap-4 sm:gap-6` | Media grid. |
| `p-2.5 sm:p-3` | Media cards. |
| `px-3 py-2.5` | Link cards. |

## Radius, Borders, And Elevation

| Token | Current value | Use |
| --- | --- | --- |
| `radius-small` | `rounded`, `rounded-sm`, `rounded-md` | Inline code, TOC links. |
| `radius-card` | `rounded-lg` | Cards, images, controls. |
| `radius-search` | `1.5rem`, mobile `1.15rem` | Search modal only. |
| `radius-rss` | `18px` to `28px` | RSS preview panels/buttons. |
| `border-subtle` | `black/5-12`, `white/7-18` | Cards and dividers. |
| `shadow-subtle` | `shadow-sm` | Images and cards. |
| `shadow-hover` | `hover:shadow-2xl` scoped to media cards | Cover-heavy cards only. |
| `shadow-rss` | hard `0 7px 0` style | RSS preview only. |

Do not introduce new default elevation levels for ordinary pages.

## Motion

| Token | Current value | Use |
| --- | --- | --- |
| `motion-reveal` | `duration-700 ease-out` | `.animate` reveal. |
| `motion-standard` | `duration-300 ease-in-out` | Links, cards, arrows. |
| `motion-fast` | `160ms` to `220ms` | Lightbox/search microstates. |
| `motion-stagger` | `150ms` | Global reveal sequence. |
| `motion-lift-small` | `translateY(-1px)` | ArrowCard, search result, image. |
| `motion-lift-card` | `hover:-translate-y-1` | Media cards. |

Prefer color, opacity, and small transforms. Avoid looping decorative motion.

## Breakpoints

| Breakpoint | Current behavior |
| --- | --- |
| Default mobile | Single-column header stack, two-column media grid. |
| `sm` | Header becomes row, larger page padding/text steps. |
| `md` | Link grid can reach three columns; media grid reaches three columns. |
| `xl` | Media grid reaches four columns; article TOC rail appears. |

## Do And Don’t

### Do

- Use these documented roles when reading or writing Tailwind classes.
- Keep dark-mode equivalents for every surface and text role.
- Keep focus states visible.
- Keep text and content width stable.
- Update this file if the implementation gains real CSS variables or design
  tokens later.

### Don’t

- Don’t hardcode a new palette into components.
- Don’t use RSS preview colors outside RSS.
- Don’t add shadows or rounded panels just to fill space.
- Don’t change font families casually.
- Don’t scale type continuously with viewport width.
