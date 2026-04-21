# Repository Guidelines

## Project Structure & Module Organization

- `src/pages/` defines Astro routes; `src/layouts/` contains page shells; `src/components/` holds reusable UI.
- `src/content/blog/` stores posts validated by `src/content.config.ts`; prefer stable, URL-safe slugs.
- `src/data/links/links.json` is the links source. `src/data/links/generated.json` is generated enrichment.
- `src/data/douban/*.json` and `public/douban/**` are Douban sync output.
- `src/lib/` contains remark plugins and utilities; `src/styles/global.css` holds global styles and font faces.
- `public/assets/**` stores static assets. `dist/`, `.astro/`, `node_modules/`, `.pnpm-store/`, and `.wrangler/` are generated or local-only.

## Setup, Build, and Development Commands

- Install: `corepack enable && pnpm install`
- Dev server: `pnpm run dev`
- Network dev server: `pnpm run dev:network`
- Lint: `pnpm run lint`
- Format/write checks: `pnpm run check:fix`
- Read-only checks: `pnpm run check`
- Markdown lint: `pnpm run md:lint`
- Secret lint: `pnpm run secrets:lint`
- Typecheck/build site: `pnpm run build:site`
- Full production build with Pagefind: `pnpm run build`
- Preview built site: `pnpm run preview`
- Install smoke-test browser: `pnpm run smoke:install`
- Smoke test: `pnpm run smoke`
- Sort links source: `pnpm run sort:links`
- Sync link assets/status: `pnpm run sync:links-assets` and `pnpm run sync:links-status`
- Sync Douban covers: `pnpm run sync:douban-covers`

## Coding Style & Naming Conventions

- Use ESM, TypeScript, Astro components, Tailwind utilities, semicolons, and double quotes.
- Biome enforces 4-space indentation, line width 100, double quotes, and organized imports.
- Follow existing aliases from `tsconfig.json`: `@components/*`, `@layouts/*`, `@lib/*`, `@consts`, and `@types`.
- Keep components/layouts PascalCase. Keep route and content slugs URL-safe and stable.
- Prefer existing UI patterns in `src/components/`, `src/pages/`, and `src/styles/global.css` over new abstractions.
- Do not add dependencies unless explicitly required. If dependencies change, update `pnpm-lock.yaml`.
- Do not change public routes, content schema, RSS/sitemap behavior, or Cloudflare deploy behavior unless requested.

## Testing & Validation

- Code changes: run `pnpm run check` and `pnpm run build:site`.
- UI, route, RSS, media, links, search, theme, article, or smoke-hook changes: run `pnpm run smoke`.
- `pnpm run smoke` builds the site, builds Pagefind, serves `dist/`, and checks desktop/mobile behavior with Playwright.
- If Chromium is missing, run `pnpm run smoke:install`, then rerun `pnpm run smoke`.
- Link source changes: run `pnpm run sort:links`, then `pnpm run build:site`.
- Content-only changes: run `pnpm run build:site`. For image-heavy posts, follow `docs/content-image-budget.md`.
- Docs-only changes may skip runtime tests; still run `pnpm run md:lint` for Markdown changes.
- If a network-backed sync fails, do not churn generated files. Report the failure and keep source edits separate.

## Generated Data & Automation

- Do not hand-edit `src/data/links/generated.json` or `public/assets/images/links/**`; use the links scripts.
- Do not hand-edit `src/data/douban/*.json` or `public/douban/**` unless the task is a Douban data refresh.
- Do not mix generated data refreshes with feature/code changes unless explicitly requested.
- Preserve `data-*` hooks used by `scripts/verify/smoke.mjs`.
- Treat `.github/workflows/**` as automation-critical. Change it only for CI/deploy/sync tasks.

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
- lint-staged runs `secretlint` for staged code, data, Markdown, YAML, TOML, env, and text files.
- `src/data/douban/**` and `src/data/links/generated.json` are excluded from Biome by `biome.json`.
- Do not bypass hooks unless explicitly requested. If hooks rewrite files, re-check and restage the changes.

## Configuration & Security Notes

- Use the Node and pnpm versions declared in `package.json` and GitHub Actions; keep local, lockfile, and CI versions aligned.
- The canonical site URL is configured in `astro.config.mjs`; do not duplicate deployment configuration casually.
- Keep secrets out of source files, `public/`, content frontmatter, and generated JSON.
- GitHub Actions deploy/sync secrets are managed outside the repo.
- Do not touch unrelated dirty or untracked files unless the task names them.
