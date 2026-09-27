# Working on this repository

This is the source of www.trustcompanyai.org. Hosting is Viktor Spaces (frontend: React + Vite + Tailwind;
backend: Convex in `convex/`). Nothing deploys from Vercel or GitHub Actions.

## How changes reach the site

1. Push to `main`.
2. A webhook rebuilds the locked preview copy automatically.
3. Changes go to the public site only after the preview has been approved.

So: commit small, push to `main`, never try to deploy yourself.

## Rules for site copy

- Describe the intake process exactly as it works (automated scans). Do not describe steps that do not exist.
- No vendor names anywhere. Collaborative tone, never prescriptive. Plain English on the site.
- Do not add, remove or reword copy that you were not asked to change; do not add nav items, CTAs or sections.
- Visual system is locked: system sans-serif, one deep blue accent (`--primary` in `src/index.css`),
  borderless grey cards (`bg-secondary rounded-2xl`), pill buttons, no shadows, no duplicate CTAs.
- Spelling: "Trust Company AI".

## Layout

- `src/site/` — public pages (HomePage, Pages, Library, SiteShell = header/footer)
- `src/pages/` — Contact, Submit, Review, Ask
- `src/components/chat/` — chat panel
- `convex/` — backend (sync from the `community` repo, search/chat, submissions, messages, webhook route)
- `scripts/test-site.ts` — copy assertions; update it when you change wording on purpose

## Commands

```bash
bun install
bun run build       # tsc + vite build — must pass before pushing
bun run check       # biome
```

Secrets are never committed; environment variables are managed in Viktor Spaces.

