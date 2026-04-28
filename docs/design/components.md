# Components

This file covers the reusable UI pieces and page-level content surfaces that
actually exist in the current repo.

Primary sources:

- `src/components/Header.astro`
- `src/components/SearchModal.astro`
- `src/components/BackToTop.astro`
- `src/components/ArrowCard.astro`
- `src/components/LinkCard.astro`
- `src/components/MediaBrowser.astro`
- `src/components/MediaTabs.astro`
- `src/components/MediaPanel.astro`
- `src/components/MediaCard.astro`
- `src/components/Footer.astro`
- `src/styles/global.css`
- `src/scripts/search-modal.ts`
- `src/scripts/media-tabs.ts`
- `src/pages/posts/index.astro`
- `src/pages/links.astro`
- `src/pages/media.astro`

## Selection Guide

| Need | Use |
| --- | --- |
| Global navigation | `Header.astro` |
| Theme control | `#theme-toggle` |
| Global search | `SearchModal.astro` |
| Dense post row | `ArrowCard.astro` |
| Compact outbound reference | `LinkCard.astro` |
| Poster-first media item | `MediaCard.astro` |
| Media browsing shell | `MediaBrowser.astro` |
| Utility footer links | `Footer.astro` |
| Return-to-top control | `BackToTop.astro` |

## Header

The header is a fixed translucent strip rendered by `PageLayout.astro`.

Current rules:

- global shell uses `px-5`
- inner width stays at `max-w-screen-md`
- mobile stacks into two rows, `sm` becomes a single row
- optional divider is controlled through `header--divider`
- nav stays text-first and stable

Current header nav:

- Archive
- Media
- Now
- About
- Links

Do not turn this into a product navbar or drawer-based mobile IA without an
intentional route model change.

## Theme Toggle and Header Actions

The theme toggle is one icon button inside the normal header-action system.

Current behavior:

- modes cycle `system -> light -> dark`
- button id is `theme-toggle`
- visible icon shows the next action
- focus uses the warm clay ring
- click temporarily suppresses transition flash

`header-action` rules:

- `size-6`
- rounded full shape
- muted text at rest
- neutral-hover text on hover
- visible focus ring

All icon-only controls need `aria-label`.

## Search Modal

Search is a command surface, not a page route.

Structural rules:

- root id: `site-search`
- hidden by default via `hidden` and `aria-hidden`
- open state adds `html.search-open`
- panel width: `min(calc(100vw - 1.8rem), 48rem)`
- panel radius: `1.5rem`, `1.15rem` on mobile
- blurred backdrop plus darkened overlay

Keyboard behavior from `src/scripts/search-modal.ts`:

- `Meta+K` / `Ctrl+K` opens and closes
- Escape closes
- shortcuts are ignored inside editable targets
- closing restores focus to the previous trigger when appropriate

States:

| State | Meaning |
| --- | --- |
| `idle` | Waiting for input |
| `loading` | Pagefind request in progress |
| `unavailable` | Search index not available |
| `empty` | No article matched |
| `results` | Result cards rendered |

Search result cards are lightly raised list items, not article previews.

## ArrowCard

`ArrowCard` is the default post-list surface on the home and archive pages.

Current composition:

- date-first grid, not title-first card
- compact horizontal rhythm
- no background panel
- hover only changes text emphasis

Variant behavior:

- `home` uses longer date width and slightly smaller title
- `archive` uses shorter month/day date width and slightly larger title

Use it for post indexes. Do not grow it into an excerpt card by default.

## LinkCard

`LinkCard` is the compact reference card used on `/links`.

Current rules:

- whole card is one external anchor
- minimum height `min-h-14`
- icon area is `size-6`
- missing image falls back to the first initial
- optional status dot sits at the top-right
- title is truncated, metadata is smaller and quieter

Current `/links` sections:

- Blogroll
- Videos
- Podcast

Status behavior:

- `up` and `limited` render green
- `down` renders rose

The card stays quiet. The favicon and status dot do the extra signaling.

## Media Browser and Cards

The Media page is built from `MediaBrowser`, `MediaTabs`, `MediaPanel`, and
`MediaCard`.

### Media tabs

- text-first tablist
- active tab uses stronger text and a bottom border
- hash sync controls active tab
- `role="tablist"`, `role="tab"`, and `role="tabpanel"` are preserved

### Media panels

- default tab is SSR-rendered with items
- other tabs start empty
- each panel owns a grid, status area, retry area, and bottom sentinel
- loading is sentinel-driven, not button-driven

### Media cards

- neutral shell, colorful cover
- `aspect-[2/3]` cover
- two-line title clamp
- amber star rating
- linked cards get focus ring and lift
- static cards preserve the same structure without anchor semantics

Keep the shell neutral and let cover art carry the color.

## Footer

The footer is a text utility strip, not a secondary navigation chrome block.

Current utility links:

- Moments
- Toolbox
- Changelog
- RSS

Rules:

- use text links, not icon buttons
- keep the right cluster compact and underlined
- keep RSS in the footer, not the main header

## Back To Top

The back-to-top control is a small floating utility.

Current rules:

- button id: `back-to-top`
- fixed bottom-right
- `size-12`
- `rounded-2xl`
- hidden until `html.scrolled`
- arrow animates directionally on hover

Do not replace it with a loud filled FAB.

## Page-Level Surfaces

### Archive

- year sections
- dense `ArrowCard` list
- no excerpts or cover images

### Links

- sectioned list of compact cards
- narrow explanatory intro
- three-column layout only when width allows

### Media

- tabs first
- poster grid second
- empty/retry/loading states stay minimal

### Changelog

- date/content chronology
- border-led grouping
- do not turn it into a card feed

## Quick Reference

| Need | Use |
| --- | --- |
| New list item | start from `ArrowCard` density |
| New utility action | muted text + visible focus + small directional motion |
| New compact card | `rounded-lg`, low-noise border, single clear purpose |
| New content grid | let content define color; keep shell neutral |

## Data Boundaries

Do not hand-edit generated or synced data during design-doc work:

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
