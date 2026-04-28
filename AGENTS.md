# Repository Guidelines

## Project Structure & Module Organization

- `src/pages/` defines Astro routes. `src/pages/posts/**` is the long-form post surface; `src/pages/media/data/**` provides JSON for media pagination.
- `src/content/*.md` stores standalone pages such as `about`, `now`, and `toolbox`. `src/content/blog/**` stores posts validated by `src/content.config.ts`.
- `src/components/` holds reusable UI, `src/layouts/` holds shells, `src/lib/` holds shared data/OG/helpers, and `src/scripts/` holds client-side behavior modules.
- `src/data/links/links.json` is the editable links source. `src/data/links/generated.json` is generated enrichment.
- `src/data/douban/*.json` and `public/douban/**` are Douban sync output.
- `src/data/og-pages.json`, `src/lib/og.ts`, and `public/assets/images/og/**` back page/post OG assets.
- `public/assets/**` stores static assets. `dist/`, `.astro/`, `node_modules/`, `.pnpm-store/`, and `.wrangler/` are generated or local-only.

## Design Reference

- Read `DESIGN.md` first for visual/styling work. It documents the current site design, not a redesign proposal.
- Use `docs/design/foundation.md`, `docs/design/reading.md`, `docs/design/components.md`, and `docs/design/rss.md` when a task touches those areas.
- If design docs and code disagree, inspect the implementation first and update docs/code together instead of trusting stale prose.

## Setup, Build, and Development Commands

- Install: `corepack enable && pnpm install`
- Dev server: `pnpm run dev`
- Lint and format check: `pnpm run check`
- Auto-fix Biome issues: `pnpm run check:fix`
- Markdown lint: `pnpm run md:lint`
- Secret lint: `pnpm run secrets:lint`
- Site typecheck/build: `pnpm run build:site`
- Full production build with Pagefind: `pnpm run build`
- Preview built site: `pnpm run preview`
- Install Playwright browser for smoke tests: `pnpm run smoke:install`
- Smoke test: `pnpm run smoke`
- Sort links source: `pnpm run sort:links`
- Networked sync scripts: `pnpm run sync:links-assets`, `pnpm run sync:links-status`, `pnpm run sync:douban-covers`

## Coding Style & Naming Conventions

- Use ESM, TypeScript, Astro components, Tailwind utilities, semicolons, and double quotes.
- Biome is the formatter/linter baseline: 4-space indentation, 100-column width, organized imports.
- Follow existing aliases from `tsconfig.json`: `@components/*`, `@layouts/*`, `@lib/*`, `@consts`, and `@types`.
- Keep components/layouts PascalCase. Keep route and content slugs stable and URL-safe.
- Prefer existing patterns in `src/components/`, `src/lib/`, `src/scripts/`, and `src/styles/global.css` over new abstractions.
- Reuse semantic CSS variables and utility patterns already defined in `src/styles/global.css`; do not introduce a new color system casually.
- Prefer extending the existing `src/scripts/*` client modules over adding large inline scripts.
- Do not add dependencies unless explicitly required. If dependencies change, update `pnpm-lock.yaml`.
- Do not change public routes, content schema, media JSON shape, RSS/sitemap behavior, or deploy/sync workflow behavior unless explicitly requested.

## Testing & Validation

- Baseline validation for code/config changes: `pnpm run check`, `pnpm run md:lint`, `pnpm run secrets:lint`, and `pnpm run build:site`.
- UI, route, search, theme, article, media, moments, links, RSS, OG, or client-script changes: also run `pnpm run smoke`.
- `pnpm run smoke` builds the site, builds Pagefind, serves `dist/`, and checks route/status/UI behavior with Playwright.
- If Chromium is missing, run `pnpm run smoke:install`, then rerun `pnpm run smoke`.
- Link source changes: run `pnpm run sort:links`, then the baseline validation. Run sync scripts only when the task explicitly needs refreshed generated data/assets.
- Content-only changes: run `pnpm run md:lint`, `pnpm run secrets:lint`, and `pnpm run build:site`. For image-heavy posts, follow `docs/content-image-budget.md`.
- Docs-only changes: run `pnpm run md:lint` and `pnpm run secrets:lint`.
- If a network-backed sync fails, do not churn generated files. Report the failure and keep source edits separate.

## Generated Data & Automation

- Do not hand-edit `src/data/links/generated.json` or `public/assets/images/links/**`; use the links scripts.
- Do not hand-edit `src/data/douban/*.json` or `public/douban/**` unless the task is a Douban data refresh.
- Do not mix generated data refreshes with feature/code changes unless explicitly requested.
- Preserve `data-*` hooks used by `scripts/verify/smoke.mjs` and the response shape expected by `src/pages/media/data/**`.
- Treat `.github/workflows/ci.yml`, `deploy.yml`, `links.yml`, and `douban.yml` as automation-critical. Change them only for CI/deploy/sync work.

## Development Workflow

- Use small, focused changes.
- Branch naming: `feature/...`, `fix/...`, `docs/...`, `refactor/...`, or `test/...`.
- Use Conventional Commit style: `type(scope): concise summary`.
- Valid types include `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`, and `build`.
- PR descriptions should state intent, implementation summary, validation run, and skipped checks.
- Include before/after screenshots for visual changes when practical.
- Do not add AI/co-author markers.

## Pre-commit Hooks

- Husky runs `pnpm exec lint-staged` from `.husky/pre-commit`.
- lint-staged runs `biome check --write --no-errors-on-unmatched` for staged JS/TS/Astro/CSS/JSON files.
- lint-staged runs `markdownlint-cli2 --fix` for staged Markdown and MDX files.
- lint-staged runs `secretlint --no-glob` for staged code, data, Markdown, YAML, TOML, env, and text files.
- `src/data/douban/**` and `src/data/links/generated.json` are excluded from Biome by `biome.json`.
- Do not bypass hooks unless explicitly requested. If hooks rewrite files, re-check and restage the changes.

## Configuration & Security Notes

- Use the Node and pnpm versions declared in `package.json` and GitHub Actions; keep `packageManager`, lockfile, and workflow versions aligned.
- CI installs with `pnpm install --frozen-lockfile`; do not leave lockfile drift behind.
- The canonical site URL is configured in `astro.config.mjs`; do not duplicate deployment configuration casually.
- Keep secrets out of source files, `public/`, content frontmatter, generated JSON, and design/docs artifacts.
- GitHub Actions deploy/sync secrets are managed outside the repo.
- Do not touch unrelated dirty or untracked files unless the task names them.
