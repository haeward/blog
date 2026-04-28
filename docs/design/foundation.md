# Foundation

This file expands the structured summary in `docs/design/design.yaml`. It
explains how the current visual system is implemented in code and how to reuse
it without inventing a second design language.

Primary sources:

- `src/styles/global.css`
- `src/layouts/PageLayout.astro`
- `src/components/*.astro`
- `src/lib/media-card.ts`
- `src/scripts/*.ts`
- `public/feed/pretty-feed.xsl`

## Why This Looks This Way

The site aims for calm reading rather than visual performance.

- warm paper is easier on the eye than pure white
- most UI stays in the same warm neutral family as the page
- accent color appears where the reader needs orientation: links, quotes,
  progress, ratings, status, and dialog focus
- content surfaces should feel thin and light, never padded into dashboard
  panels

## Color System

The project uses lightweight CSS variables on `body` and `html.dark body`.
These are the real reusable roles.

### Core text and surface roles

| Role | Light | Dark | Notes |
| --- | --- | --- | --- |
| Page canvas | `#efeee9` | `stone-900` | Base page background. |
| Header canvas | `#efeee9/88` | `stone-900/25` | Fixed translucent header. |
| Primary text | `#343331` | `#d6d1c8` | Default readable text. |
| Heading text | `--site-color-text-heading` | same role | Titles and active states. |
| Body text | `--site-color-text-body` | same role | Reading surfaces. |
| Muted text | `--site-color-text-muted` | same role | Dates, counts, hints. |
| Neutral hover | `--site-color-text-neutral-hover` | same role | Low-noise hover text. |
| Border | `--site-color-surface-border` | same role | Cards, lines, rings. |
| Strong border | `--site-color-surface-border-strong` | same role | Stronger hover ring/border. |

### Link roles

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `--site-link` | `#9f542f` | `#f0b58f` | Shared warm clay link base. |
| `--site-link-hover` | `#a25832` | `#f1b994` | Text-link hover. |
| `--site-link-strong-hover` | `#7c3f23` | `#ffd7bc` | Strong active hover. |
| `--site-link-decoration` | warm clay alpha | warm clay alpha | Underline decoration. |
| `--site-link-focus` | warm clay alpha | warm clay alpha | Focus outline/ring. |
| `--site-link-focus-bg` | warm clay alpha | warm clay alpha | Focus fill on nav/text links. |

Rules:

- prose links and UI links share one warm clay family
- links are not permanently underlined in normal state
- hover and focus reveal emphasis rather than switching to a brand-new color
- external links may use the same family but slightly stronger emphasis

### Accent roles

| Role | Light | Dark | Used by |
| --- | --- | --- | --- |
| Blockquote border/fill | orange | orange on dark neutral | Article quotes. |
| Inline code text | red-600 | red-400 | Inline code only. |
| Rating stars | amber-300 | amber-200 | Media cards. |
| Status up | emerald-500 | emerald-500 | Link availability dot. |
| Status down | rose-500 | rose-500 | Link availability dot. |
| TOC active/progress | warm clay external link | same role | Reading progress. |

### RSS exception

The RSS preview palette is intentionally separate:

- yellow background
- cream panel
- dark ink borders
- red links

Do not reuse it in normal site pages.

## Typography

The current implementation differs from the older docs: the main readable face
is `LXGW Neo XiHei`, not Noto Serif.

| Role | Current implementation | Use |
| --- | --- | --- |
| UI shell | `font-sans` / system UI | Header, nav, small controls. |
| Reading/title face | `LXGW Neo XiHei` | `.serif-reading-*`, TOC labels, search result titles. |
| Mono | `JetBrains Mono` | Code, RSS utility text, small machine-like labels. |

Important note:

- `.serif-reading-surface` and `.serif-reading-title` are historical class
  names; they currently map to `LXGW Neo XiHei`

### Active scale

| Surface | Size pattern |
| --- | --- |
| Page titles | `text-3xl sm:text-4xl` |
| Post title | `text-xl sm:text-2xl` |
| Article body | `1.04rem` to `1.06rem`, `leading-8` |
| Dense list title | `1.03rem` to `1.16rem` |
| Link card title | about `0.89rem` |
| Search excerpt | `0.95rem`, `line-height: 1.65` |
| Micro meta | `0.7rem` to `0.88rem` |

Do not add viewport-width type scaling or negative tracking.

## Layout and Spacing

Stable dimensions matter more here than dramatic variation.

| Pattern | Current rule |
| --- | --- |
| Main container | `max-w-screen-md px-5` |
| Main vertical rhythm | `py-12 sm:py-16` |
| Article shell | `max-w-screen-md` |
| Search panel | `min(calc(100vw - 1.8rem), 48rem)` |
| RSS preview shell | `44rem` |
| Media cover ratio | `aspect-[2/3]` |

Frequent spacing values:

- `gap-1` for dense post lists
- `space-y-6` to `space-y-10` for page sections
- `gap-x-7 gap-y-6` on the Links grid
- `gap-4 sm:gap-6` on the Media grid
- `p-2.5 sm:p-3` on Media cards
- `px-2.25 py-2.5` on Link cards

## Shape, Border, and Depth

The site uses small radii and light depth.

| Role | Current value | Use |
| --- | --- | --- |
| Small radius | `rounded` to `rounded-md` | Inline code, TOC links, small shells. |
| Card radius | `rounded-lg` | Link cards, media cards, images. |
| Utility radius | `rounded-full` to `rounded-2xl` | Header actions, back-to-top. |
| Search radius | `1.5rem` / `1.15rem mobile` | Search modal only. |
| Default depth | subtle border or `shadow-sm` | Cards and figures. |
| Strong depth | stronger shadow on hover | Mostly Media cards and lightbox. |

Rules:

- ordinary page sections should not become floating cards
- hard shadow stacks belong only to the RSS preview
- stronger elevation should be rare and content-led

## Motion

Current motion language:

- `.animate` reveal: `700ms ease-out`
- most hover transitions: `200ms` to `300ms`
- lightbox/search open states: `140ms` to `260ms`
- typical lift: `translateY(-1px)`
- typical directional motion: short arrow travel

Use motion to confirm action, not to advertise it.

## Decision Table

| Need | Use |
| --- | --- |
| New text role | start from `--site-color-text-*` before adding a fresh color |
| New interactive text | start from `--site-link-*` |
| New subtle border | start from `--site-color-surface-border` |
| New compact surface | `rounded-lg` with low-noise border/background |
| New utility control | muted text + clear focus ring + small hover shift |
| New accent | only if it has a semantic job and does not crowd warm clay/orange/amber |

## Do and Don’t

### Do

- reuse the existing CSS variables for repeated color roles
- keep dark-mode equivalents for every new repeated role
- keep widths and spacing stable across similar pages
- update this file when the implementation changes materially

### Don’t

- don’t hardcode a new palette into one component
- don’t treat this repo as if it already had a full token framework
- don’t reintroduce the old Noto Serif/Noto Sans narrative
- don’t use the RSS preview palette outside RSS
