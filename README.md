# Trust Company AI — website

Source code for [trustcompanyai.org](https://www.trustcompanyai.org), the plain-English companion to the
[trust-company-ai/community](https://github.com/trust-company-ai/community) repository.

The site reads the documents in the `community` repository and shows them in the Library, answers questions
about them in Ask, and accepts document submissions via Share. Content lives in `community`; this repository
holds only the code that displays it.

## Layout

- `src/site/` — pages (home, Library, Ask, Share) and shared layout
- `convex/` — backend: document sync from GitHub (`sync.ts`), search and chat (`kb.ts`), submissions (`submissions.ts`), webhook route (`http.ts`)
- `public/` — static assets

## Running locally

```bash
bun install
bunx convex dev        # backend
bun run dev            # frontend
```

Configuration is via environment variables (see `.env.example`); no keys are stored in this repository.

## License

Apache 2.0, matching the `community` repository.
