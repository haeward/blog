# Reading

This file documents the implemented reading experience for articles and other
content-led pages.

Primary sources:

- `src/pages/posts/[...slug].astro`
- `src/components/PostHeader.astro`
- `src/components/PostNavigation.astro`
- `src/components/TableOfContents.astro`
- `src/components/ImageLightbox.astro`
- `src/components/LinkEnhancer.astro`
- `src/styles/global.css`
- `src/scripts/blog-toc.ts`
- `src/scripts/article-lightbox.ts`

## Reading Shell

Article pages use a narrow, centered frame:

- outer page gutter: `px-5`
- shell: `.blog-post-shell` = `relative mx-auto max-w-screen-md`
- main column: `.blog-post-main` = `min-w-0 w-full`
- article element: `animate mt-10 blog-article serif-reading-surface
  site-prose-links`

The article title and metadata live outside rendered Markdown. That keeps the
page shell stable even when post content structure changes.

Current header rules:

- title: `.serif-reading-title text-xl sm:text-2xl font-bold`
- meta row: `flex flex-wrap items-center gap-x-3 gap-y-1 text-sm`
- metadata is icon-led and quiet, not banner-like

Do not wrap the article header in a hero card.

## Prose Rules

The `article` selector in `src/styles/global.css` is the main reading contract.

Current behavior:

- `max-w-full prose dark:prose-invert`
- base text `1.04rem`, paragraphs `1.06rem`, `leading-8`
- paragraphs and list items use medium weight with small positive tracking
- headings use `font-bold` and `--site-color-text-heading`
- long words can break with `overflow-wrap: anywhere`

Heading spacing is tighter than default typography plugin output:

- `h1`: `mt-8 mb-4`
- `h2`: `mt-6 mb-3`
- `h3`: `mt-5 mb-2`
- `h4`: `mt-4 mb-2`
- `h5`, `h6`: `mt-3 mb-1`

The result should feel compact, readable, and steady from paragraph to heading.

## Typography Reality

The current reading face is `LXGW Neo XiHei`. Older references to Noto Serif are
outdated for this repo.

Important implementation detail:

- `.serif-reading-surface` and `.serif-reading-title` are historical class
  names
- in the current code, both classes map to `LXGW Neo XiHei`

When updating reading docs or CSS, follow the implementation, not the class
name.

## Multilingual Content

The page root sets `lang={post.data.lang}` through `PageLayout`. Mixed-language
readable surfaces use `data-language-scan="true"` where needed.

Rules:

- set the root `lang` when the page language is known
- keep language scanning for readable mixed-language content
- do not apply language scanning to controls, code, inputs, or SVG

## Links and Emphasis

Article links use the site-wide warm clay link system plus article-specific
accessibility handling from `LinkEnhancer.astro`.

Current rules:

- links are bold
- links are not underlined at rest
- hover/focus reveals underline and a restrained color shift
- focus adds a visible outline and light background
- high-contrast mode forces stronger underline and outline
- reduced-motion mode removes transitions

Strong text:

- stays in heading color
- gets small inline padding and rounded corners
- should not be styled to resemble a separate badge system

## Blockquotes

Blockquotes are compact callouts inside the reading flow.

Current style:

- no italics
- orange left border
- soft orange background in light mode
- soft neutral background in dark mode
- bold text around `1.02rem`
- `rounded-r-md` and `shadow-sm`

On the About page only, blockquotes become lighter and more note-like. That is
an intentional local exception.

## Code and Tables

Inline code:

- uses `JetBrains Mono`
- uses red foreground
- uses small padding and a small radius
- suppresses default Tailwind Typography backticks

Code blocks:

- `bg-gray-100/90` or `dark:bg-zinc-800/85`
- low-noise border
- `rounded-lg p-4 my-6`
- hover-only copy affordance rendered as a pseudo-element

Tables:

- centered and rounded
- lightly bordered with the site text color mixed into transparency
- header row gets a faint warm link tint

Do not add a second visible copy button without changing the global pattern.

## Figures and Images

Figures support the article; they should not dominate it by default.

Current rules:

- `figure` uses centered layout and generous vertical rhythm
- images are rounded and lightly shadowed
- `.blog-figure__image` is capped at `46rem`
- captions are centered, medium weight, and relaxed
- article images show `cursor: zoom-in`
- hover adds a very small lift and shadow increase

Image-heavy posts should still follow
`docs/content-image-budget.md`.

## Image Lightbox

The article lightbox is an enhancement around normal images, not a gallery
system.

Behavior from `src/scripts/article-lightbox.ts`:

- only images inside `.blog-article` participate
- linked images are skipped
- images with `data-no-zoom="true"` are skipped
- overlay opens by copying `currentSrc` / `src`
- caption mirrors the image `alt` text
- Escape closes
- clicking the backdrop or the overlay image closes

Visual behavior from CSS:

- overlay fills the viewport at `z-index: 200`
- backdrop is `rgba(0, 0, 0, 0.85)`
- image and figure animate in with short scale/opacity motion
- `html.image-lightbox-open` disables background scroll

## Table of Contents

The TOC is a reading-progress tool, not global navigation.

Source rules:

- eligible headings are only `h2`, `h3`, and `h4`
- no eligible headings means no TOC

Two variants exist:

- mobile TOC inside the article flow, hidden at `xl`
- desktop TOC rail outside the article column at `xl`

Current behavior:

- hidden until reading progress reaches at least `1%`
- active item follows viewport position
- progress bar width tracks article progress
- depth is expressed through line length
- active state increases weight, contrast, and line width

Do not move the desktop TOC inside the main article column.

## Previous and Next

Adjacent-post navigation appears only when there is a previous or next post.

Rules:

- separate it from the article with a thin `hr`
- stack on mobile, split at `sm`
- keep labels minimal
- use small directional arrow motion only

## Anti-Patterns

- no article hero cards
- no wide prose columns
- no decorative wrappers around normal reading content
- no image dump before the article establishes structure
- no separate link system just for articles

- Do not use a wide article layout for normal posts.
- Do not wrap the article body in a card.
- Do not add decorative hero sections to articles.
- Do not use hover-only interactions for essential article controls.
- Do not remove `lang`, `data-language-scan`, `data-pagefind-body`, or heading
  IDs from reading surfaces.
- Do not hand-edit generated Douban or link data as part of article design work.
