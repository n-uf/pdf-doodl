<h1 align="center">
  doodl
</h1>
<p align="center">Canvas drawing and annotation for the web</p>

`@n-uf/doodl` is a vanilla-first canvas drawing and annotation library with React,
PDF, and ready-made UI bindings. Shape-centric modules cover rendering,
hit-testing, transforms, and JSON serialization.

## Quick links

- Documentation homepage: <https://doodl.n-uf.com/> *(pending hosting)*
- Package READMEs:
  - [`packages/doodl`](packages/doodl/README.md)
  - [`packages/doodl-react`](packages/doodl-react/README.md)
  - [`packages/doodl-pdf-react`](packages/doodl-pdf-react/README.md)
  - [`packages/doodl-go`](packages/doodl-go/README.md)
- GitHub issues: <https://github.com/n-uf/doodl/issues> *(pending repo create)*

## Packages

| Package | Description |
|---|---|
| `@n-uf/doodl` | Core canvas engine (framework-agnostic) |
| `@n-uf/doodl-react` | React bindings and page annotation layer |
| `@n-uf/doodl-pdf-react` | PDF annotation viewer/page components |
| `@n-uf/doodl-go` | Ready-to-use drawing UI shell |

## Install

```bash
pnpm add @n-uf/doodl @n-uf/doodl-react react react-dom
```

Optional PDF / UI shells:

```bash
pnpm add @n-uf/doodl-pdf-react @n-uf/doodl-go react-pdf pdfjs-dist
```

`react` and `react-dom` are peer dependencies (version `^19`).

## Repository layout

```
packages/doodl/            Core published package
packages/doodl-react/      React bindings
packages/doodl-pdf-react/  PDF + React bindings
packages/doodl-go/         UI shell
apps/web/                  Showcase / docs site (Next.js)
_agent/                    Contributor architecture notes
```

## Dev / test / build

```bash
pnpm install
pnpm dev              # apps/web showcase
pnpm typecheck
pnpm test
pnpm check
pnpm build:packages   # tsup build for all publishable packages
pnpm build            # packages + web
```

## Versioning

Calendar versioning `YY.M.R` — see [`_agent/versioning-policy.md`](_agent/versioning-policy.md).

## License

[PolyForm Perimeter 1.0.1](LICENSE)
