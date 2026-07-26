# Contributing to doodl

This guide is for **contributors** working on the `@n-uf/pdf-doodl*` packages.

## Repository layout

```
packages/pdf-doodl/            Core canvas engine
packages/pdf-doodl-react/      React bindings
packages/pdf-doodl-pdf-react/  PDF annotation components
packages/pdf-doodl-go/         Ready-to-use UI shell
apps/web/                  Showcase / docs site
_agent/                    Contributor architecture notes
```

## Dev / test / build

Root scripts use [Turborepo](https://turbo.build) (`turbo run …`). Package `package.json` scripts remain the tasks turbo invokes.

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
