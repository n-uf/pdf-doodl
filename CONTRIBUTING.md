# Contributing to doodl

This guide is for **contributors** working on the `@n-uf/doodl*` packages.

## Repository layout

```
packages/doodl/            Core canvas engine
packages/doodl-react/      React bindings
packages/doodl-pdf-react/  PDF annotation components
packages/doodl-go/         Ready-to-use UI shell
apps/web/                  Showcase / docs site
_agent/                    Contributor architecture notes
```

## Dev / test / build

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm check
pnpm build:packages
pnpm build
```

## Versioning

Use calendar versioning `YY.M.R` (see `_agent/versioning-policy.md`).
Each publishable package has `scripts/calendar-version-bump.mjs` and a `release` script.

## License

PolyForm Perimeter 1.0.1 — see `LICENSE`.
