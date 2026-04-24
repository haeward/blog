# Reading

This document defines the article and prose design rules for the blog. The main
implementation lives in `src/pages/posts/[...slug].astro`, `src/pages/about.astro`,
`src/styles/global.css`, `src/components/TableOfContents.astro`, and
`src/components/LinkEnhancer.astro`.

Shared link color rules are documented in `docs/design/links.md`.

## Reading Shell

Article pages use a centered, narrow shell:

- The outer article page uses `px-5`.
- `.blog-post-shell` is `relative mx-auto max-w-screen-md`.
- `.blog-post-main` is `min-w-0 w-full`.
- The body article uses `class="animate mt-10 blog-article serif-reading-surface"`.
- The article carries `data-pagefind-body` so search indexes the content.
- The article receives `lang={post.data.lang}` and `data-language-scan="true"`.

The article title sits above the prose, not inside the generated Markdown body.
It uses `.serif-reading-title`, `text-xl sm:text-2xl`, `font-bold`,
`text-black/90`, and `dark:text-white/95`.

The meta row is compact and wraps:

- Use `flex flex-wrap items-center`.
- Use `gap-x-3 gap-y-1`.
- Keep text at `text-sm`.
- Keep background aligned with the page canvas: `bg-stone-100` and
  `dark:bg-stone-900`.
- Use small icons for date, word count, and reading time.
- Use muted separators with `aria-hidden="true"`.

Do not create a large article header card. The title, metadata, and body should
feel like one continuous reading surface.

## Prose Typography

The `article` rule in `src/styles/global.css` overrides Tailwind Typography to
match the current reading style.

Core prose settings:

- `max-w-full prose dark:prose-invert`.
- `text-[1.04rem] leading-8`.
- `font-serif`.
- Headings use `font-bold`, serif type, and `tracking-[0.01em]`.
- Paragraphs use `text-[1.06rem]`, `leading-8`, `font-medium`, and
  `tracking-[0.014em]`.
- List items use `text-[1.04rem]`, `leading-8`, `font-medium`, and
  `tracking-[0.012em]`.
- Body text uses `text-black/85` and `dark:text-white/85`.
- List text uses `text-black/84` and `dark:text-white/84`.
- Content breaks words with `break-words` and `overflow-wrap: anywhere`.

Heading spacing is intentionally tighter than default prose:

- `h1`: `mt-8 mb-4`.
- `h2`: `mt-6 mb-3`.
- `h3`: `mt-5 mb-2`.
- `h4`: `mt-4 mb-2`.
- `h5` and `h6`: `mt-3 mb-1`.

Do not widen line length to make articles feel more spacious. Readability comes
from the column width, line height, and serif stack.

## Multilingual Text

The reading stack supports English, Chinese, and Japanese.

- `.serif-reading-surface` and `.serif-reading-title` default to `Noto Serif`.
- `:lang(zh)` switches to `Noto Serif SC`.
- `:lang(ja)` switches to `Noto Serif JP`.
- The global script scans elements marked with `data-language-scan="true"`.
- Mixed Han, Hiragana, and Katakana segments are wrapped with generated `lang`
  spans when needed.

When adding a content surface:

- Set the root `lang` when the content has a known language.
- Add `data-language-scan="true"` for mixed-language readable text.
- Do not add language scanning to controls, code, inputs, or SVG content.

## Links And Emphasis

Article links are intentionally stronger than generic UI links:

- Links are bold.
- Links are not underlined by default.
- Internal links use muted Warm Clay brown.
- External and mail links use warmer copper.
- Hover and focus add a thinner underline with a restrained Warm Clay color shift.
- Link transitions use `duration-300 ease-in-out`.
- `LinkEnhancer` adds external-link behavior and accessible labels.

Article link focus is defined in `LinkEnhancer.astro`:

- Focus gets a visible outline.
- `focus-visible` adds a subtle background.
- High-contrast preference forces stronger underline and outline.
- Reduced-motion preference removes article link transitions.

Strong text is bold and high contrast:

- Use `text-black` and `dark:text-white`.
- Keep the current small padding and rounded background behavior.
- Do not use color alone to make strong text look like a link.

## Blockquotes

Blockquotes are semantic callouts, not decorative pull quotes.

Current styling:

- Not italic.
- Left border: `border-orange-400/85` or `dark:border-orange-500/85`.
- Background: `bg-orange-100` or `dark:bg-neutral-500/10`.
- Text: `text-orange-800` or `dark:text-orange-200`.
- Spacing: `mx-1 my-2 px-4 py-3`.
- Shape: `rounded-r-md`.
- Weight: bold at about `1.02rem`.
- Shadow: `shadow-sm`.

Blockquote paragraphs reset margins and remove generated quote marks. Do not
nest other card-like surfaces inside blockquotes.

## Code

Inline code and code blocks use `JetBrains Mono`.

Inline code:

- Text color is red, `text-red-600` or `dark:text-red-400`.
- Use `px-1.5 py-0.5`.
- Use a small radius.
- Suppress Tailwind Typography backtick pseudo-elements.

Code blocks:

- Use `bg-gray-100/90` or `dark:bg-zinc-800/85`.
- Use a low-opacity border.
- Use `rounded-lg`, `p-4`, and `my-6`.
- Use `overflow-x-auto`.
- Use `text-sm`, `font-mono`, and relaxed line height.
- Preserve Shiki light/dark variables through the global `pre code *` rules.

The copy affordance is a pseudo-element button in the upper-right of `pre`. It
appears on hover and is clicked through the global document handler. Do not add a
second visible copy button unless the code block implementation is changed
across the site.

## Figures And Images

Figures should support reading, not interrupt it.

Current rules:

- `figure` uses `my-6` and centered text.
- `.blog-figure` uses `my-8`.
- Images are `max-w-full h-auto mx-auto rounded-lg shadow-sm`.
- `.blog-figure__image` is capped at `min(100%, 46rem)`.
- Captions are centered, medium weight, relaxed, and muted.
- Article images get `cursor: zoom-in`.
- Hover lifts article images by `translateY(-1px) scale(1.01)` and adds shadow.

Image-heavy posts must also follow `docs/content-image-budget.md`:

- Keep the opening viewport to one lead image, or two only when needed.
- Treat twenty content images as the default upper target.
- Prefer source widths at or below `1440px`.
- Keep captions descriptive.

Do not stack many full-width images before the first meaningful section break.

## Image Lightbox

Article images open into `#image-lightbox` when they are not inside links and do
not set `data-no-zoom="true"`.

Lightbox behavior:

- The overlay is fixed, full-screen, and `z-index: 200`.
- The backdrop is black at high opacity.
- The figure is a dialog with `aria-modal="true"` and label `"Image viewer"`.
- The selected image is loaded into `.image-lightbox__img`.
- The caption mirrors the image alt text when present.
- Escape closes the overlay.
- Clicking backdrop or image elements with `data-close="true"` closes it.
- The document root gets `image-lightbox-open` to prevent background scroll.

Images need useful alt text when the caption should be meaningful in the
lightbox.

## Table Of Contents

The article TOC is a reading-progress aid. It is not a second navigation system
for all pages.

TOC source rules:

- Use Markdown headings from Astro render output.
- Include only depths `2`, `3`, and `4`.
- Skip TOC entirely when there are no eligible headings.

Desktop placement:

- `.blog-post-toc-rail` is hidden until `xl`.
- It is fixed at vertical center with `top-1/2 -translate-y-1/2`.
- It is `w-48`.
- Horizontal position is computed to sit outside the article column.

TOC visual behavior:

- Text is small and muted: `text-sm text-black/68 dark:text-white/62`.
- Links use `text-[0.74rem]`, `rounded-md`, and compact padding.
- Heading depth is shown by line width.
- Active state increases font weight, text contrast, line width, and line height.
- The progress bar uses `--blog-toc-progress` and `#c67c5a`.
- The TOC is hidden until article progress is at least one percent.

Do not show a desktop TOC inside the main article column. The article column
must stay visually clean.

## Previous And Next Links

Previous and next article links appear only when adjacent posts exist.

Rules:

- Separate them from the article with a thin `hr`.
- Use a responsive column-to-row layout: stacked on small screens, side by side
  at `sm`.
- Use arrow icons with small horizontal hover motion.
- Truncate titles at desktop widths, but allow wrapping on mobile.
- Keep labels visually minimal; the title and direction arrow carry the action.

## Do Not

- Do not use a wide article layout for normal posts.
- Do not wrap the article body in a card.
- Do not add decorative hero sections to articles.
- Do not use hover-only interactions for essential article controls.
- Do not remove `lang`, `data-language-scan`, `data-pagefind-body`, or heading
  IDs from reading surfaces.
- Do not hand-edit generated Douban or link data as part of article design work.
