# Components

This document defines reusable UI patterns and content surfaces. It combines the
site’s navigation, command surfaces, cards, lists, media grids, changelog, and
footer controls.

Primary implementation files:

- `src/components/Header.astro`
- `src/components/SearchModal.astro`
- `src/components/BackToTop.astro`
- `src/components/ArrowCard.astro`
- `src/components/LinkCard.astro`
- `src/components/MediaCard.astro`
- `src/components/Footer.astro`
- `src/components/YearProgress.astro`
- `src/pages/posts/index.astro`
- `src/pages/links.astro`
- `src/pages/media.astro`
- `src/pages/changelog.astro`
- `src/styles/global.css`

## Component Selection Guide

| Need | Use | Notes |
| --- | --- | --- |
| Site navigation | `Header.astro` | Fixed, translucent, compact. |
| Theme control | `#theme-toggle` | Three-state cycle. |
| Global search | `SearchModal.astro` | Command surface, not a route. |
| Return to top | `BackToTop.astro` | Fixed rounded square. |
| Post list item | `ArrowCard.astro` | Title/date/arrow row. |
| External reference | `LinkCard.astro` | Compact card with favicon/status. |
| Media item | `MediaCard.astro` | Poster, title, rating. |
| Change log entry | Changelog page grid | Date/content row, not card. |
| Footer progress | `YearProgress.astro` | Quiet mono square progress. |

## Header

The header is a fixed tool strip.

Rules:

- Render through `PageLayout.astro`.
- Align inner content to `max-w-screen-md`.
- Use `px-5`, `fixed`, `z-50`, `backdrop-blur`.
- Use `bg-stone-100/85` and `dark:bg-stone-900/25`.
- Add `header--divider` only when a page needs a subtle bottom border.
- Stack on mobile, switch to row at `sm`.
- Keep top-level nav stable: Archive, Media, Now, About, Links.

Do not turn the header into a wide marketing nav or add a large mobile drawer
without changing the navigation model intentionally.

## Theme Toggle

The theme toggle cycles:

1. `system`
2. `light`
3. `dark`

Rules:

- Button id: `theme-toggle`.
- State attribute: `data-theme-mode`.
- Storage key: `localStorage.theme`.
- Resolved dark mode: `html.dark`.
- Icon visibility: `html[data-theme-mode]`.
- Accessible text: update `aria-label` and `title` to the next mode.
- Switching temporarily disables transitions to avoid theme-flash animation.

Do not split this into separate light and dark controls.

## Header Actions

Use `.header-action` for small global icon controls.

| Property | Rule |
| --- | --- |
| Size | `size-6` |
| Shape | `rounded-full` |
| Text | `text-stone-600`, `dark:text-stone-300` |
| Hover | `hover:text-black`, `dark:hover:text-white` |
| Focus | `focus-visible:ring-2 focus-visible:ring-cyan-500/70` |

All icon-only controls need `aria-label`.

## Search Modal

Search is a global command surface.

Root behavior:

- Root id: `site-search`.
- Hidden by default with `hidden` and `aria-hidden="true"`.
- Opening adds `html.search-open`.
- Closing restores hidden state and focus when appropriate.
- Shortcut: `Meta+K` or `Ctrl+K`, except inside editable targets.
- Escape closes.

Panel rules:

- Full-screen fixed overlay with `z-index: 150`.
- Blurred backdrop with subtle radial light layer.
- Panel width: `min(calc(100vw - 1.8rem), 48rem)`.
- Panel radius: `1.5rem`, mobile `1.15rem`.
- Low-opacity border and layered shadow.

Search states:

| State | Behavior |
| --- | --- |
| `idle` | Prompt user to type a keyword. |
| `loading` | Spinner and loading copy. |
| `unavailable` | Explain Pagefind is unavailable in dev mode. |
| `empty` | Explain no articles matched. |
| `results` | Render up to eight Pagefind results. |

Preserve `data-search-*` hooks and dialog semantics.

## ArrowCard

`ArrowCard` is the default post-list row.

| Element | Current style |
| --- | --- |
| Row | `flex flex-wrap items-center gap-x-2 gap-y-1 py-2 px-3` |
| Hover | `hover:-translate-y-px`, stronger text color |
| Title | `.serif-reading-title`, `1.08rem sm:1.14rem`, semibold |
| Date | `text-xs sm:text-sm`, muted |
| Arrow | Stroke-only SVG with animated line/chevron |

Use it for title/date lists. Do not add excerpts, images, or card backgrounds by
default.

## LinkCard

`LinkCard` is the compact external-link directory card.

Rules:

- Outer element is an `li`.
- Anchor is external with `target="_blank"` and `rel="noopener noreferrer"`.
- Minimum height is `min-h-14`.
- Icon area is `size-6`.
- Image alt is empty when adjacent text names the link.
- Missing image falls back to title initial.
- Status dot uses `role="img"`, `aria-label`, and `title`.

| Surface | Current style |
| --- | --- |
| Light | `border-black/5 bg-white/35` |
| Dark | `dark:border-white/7 dark:bg-white/[0.025]` |
| Hover | Slightly stronger border/background |
| Focus | Ring with stone page offset |

Status roles:

- `up` and `limited`: emerald.
- `down`: rose.

## MediaCard

`MediaCard` is a poster-first card.

Rules:

- Poster area uses `aspect-[2/3]`.
- Cover images are lazy and async.
- Missing cover shows `No cover`.
- Title clamps to two lines.
- Rating is five SVG stars plus screen-reader text.
- Linked cards wrap the whole card in an external anchor.
- Non-linked cards keep the same visual structure as a `div`.

Styling:

- `rounded-lg p-2.5 sm:p-3`.
- `shadow-sm ring-1 ring-black/5`.
- Hover lift and stronger shadow.
- Cover image scales slightly on hover.
- Stars use amber.

Do not add colorful frames; cover art provides the color.

## Media Tabs And Load More

Media tabs are category controls.

- Tablist uses `role="tablist"`.
- Tabs use `role="tab"`, `aria-selected`, `aria-controls`, `data-tab`,
  `data-active`.
- Panels use `role="tabpanel"` and `aria-labelledby`.
- Active tab uses stronger text and bottom border.
- URL hash syncs the active tab.
- Each tab loads up to `100` items initially.
- `Load more` appends another page.

Do not convert this page to infinite scroll.

## Changelog

The changelog is a date/content grid.

- Eyebrow: `.changelog-page__eyebrow`.
- Year section: `.changelog-year`, top border, responsive two-column grid.
- Entry: `.changelog-entry`, date column and content column.
- Date: mono, muted, small, tracked.
- Content: `.serif-reading-surface`, `leading-7`.

Do not turn changelog rows into cards.

## Footer And Year Progress

Footer rules:

- Use `Container`.
- Keep links text-based and underlined where appropriate.
- RSS remains a utility footer link, not a primary nav item.
- `YearProgress` is small, mono, and informational.
- Progress squares are twenty small bordered cells.

Do not move year progress into a dashboard widget.

## Back To Top

Rules:

- Button id: `back-to-top`.
- Fixed bottom-right.
- Size: `size-12`.
- Shape: `rounded-lg`.
- Hidden until `html.scrolled`.
- Uses arrow reveal motion.
- Scrolls smoothly to top.

Do not replace it with a filled floating action button.

## Data Boundaries

Do not hand-edit generated or synced data while doing visual work:

- `src/data/links/generated.json`
- `public/assets/images/links/**`
- `src/data/douban/*.json`
- `public/douban/**`

Use the sync scripts named in `AGENTS.md` for data refresh work.

## Do And Don’t

### Do

- Start from existing components before adding a new one.
- Keep surfaces small and readable.
- Preserve semantic attributes and `data-*` hooks.
- Make hover and focus states visible.
- Keep dark mode parity.

### Don’t

- Don’t nest cards.
- Don’t wrap whole page sections in decorative cards.
- Don’t add filters or tabs unless content volume requires them.
- Don’t use hover-only affordances for essential actions.
- Don’t add a new visual language for modals.
