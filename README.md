<h1 align="center">
  doodl
</h1>
<p align="center">Canvas drawing and annotation for the web</p>

`@n-uf/pdf-doodl` is a vanilla-first canvas drawing and annotation library with React,
PDF, and ready-made UI bindings. Shape-centric modules cover rendering,
hit-testing, transforms, and JSON serialization.

This repository is named **pdf-doodl** (product-line home under n-uf). Published
packages use the `@n-uf/pdf-doodl*` scope to match the hypr-style naming
(`packages/<name>` ↔ `@n-uf/<name>`). The core engine remains framework-agnostic
canvas annotation; PDF support lives in `@n-uf/pdf-doodl-pdf-react`.

## Quick links

- Documentation homepage: <https://doodl.n-uf.com/> *(pending hosting)*
- Repository: <https://github.com/n-uf/pdf-doodl>
- Package READMEs:
  - [`packages/pdf-doodl`](packages/pdf-doodl/README.md)
  - [`packages/pdf-doodl-react`](packages/pdf-doodl-react/README.md)
  - [`packages/pdf-doodl-pdf-react`](packages/pdf-doodl-pdf-react/README.md)
  - [`packages/pdf-doodl-go`](packages/pdf-doodl-go/README.md)
- GitHub issues: <https://github.com/n-uf/pdf-doodl/issues>

## Packages

| Package | Description |
|---|---|
| `@n-uf/pdf-doodl` | Core canvas engine (framework-agnostic) |
| `@n-uf/pdf-doodl-react` | React bindings and page annotation layer |
| `@n-uf/pdf-doodl-pdf-react` | PDF annotation viewer/page components |
| `@n-uf/pdf-doodl-go` | Ready-to-use drawing UI shell |

## Install

```bash
pnpm add @n-uf/pdf-doodl @n-uf/pdf-doodl-react react react-dom
```

Optional PDF / UI shells:

```bash
pnpm add @n-uf/pdf-doodl-pdf-react @n-uf/pdf-doodl-go react-pdf pdfjs-dist
```

`react` and `react-dom` are peer dependencies (version `^19`).

## Repository layout

```
packages/pdf-doodl/            Core published package
packages/pdf-doodl-react/      React bindings
packages/pdf-doodl-pdf-react/  PDF + React bindings
packages/pdf-doodl-go/         UI shell
apps/web/                  Showcase / docs site (Next.js)
_agent/                    Contributor architecture notes
```

## Dev / test / build

Turborepo orchestrates workspace tasks (`turbo.json`). Package-level scripts stay the source of truth; root scripts call `turbo run …`.

```bash
pnpm install
pnpm dev              # apps/web showcase
pnpm typecheck
pnpm test
pnpm check            # typecheck + test (via turbo)
pnpm build:packages   # tsup build for all publishable packages
pnpm build            # packages + web
```

## Versioning

Calendar versioning `YY.M.R` — see [`_agent/versioning-policy.md`](_agent/versioning-policy.md).

## License

[PolyForm Perimeter 1.0.1](LICENSE)
