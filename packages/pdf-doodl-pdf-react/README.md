# @n-uf/pdf-doodl-pdf-react

PDF annotation components and hooks for React.

## Install

```bash
pnpm add @n-uf/pdf-doodl-pdf-react @n-uf/pdf-doodl @n-uf/pdf-doodl-react react react-dom react-pdf pdfjs-dist
```

Import browser-only components via dynamic import to avoid SSR issues.

## Tailwind v4: `@source` class tokens

Exported chrome tokens (`PDF_ZOOM_PERCENT_BUTTON_CLASS`, `PDF_ZOOM_STEP_BUTTON_CLASS`,
`PDF_FIT_CYCLE_BUTTON_CLASS`, `FIND_BAR_*`) are string constants. Tailwind only
emits utilities it sees in scanned files — **importing a constant does not
prevent purge**.

In the host app CSS:

```css
@import "tailwindcss";
@source "../node_modules/@n-uf/pdf-doodl-pdf-react/src/**/*.{ts,tsx}";
/* or, for published installs that ship only dist: */
@source "../node_modules/@n-uf/pdf-doodl-pdf-react/dist/**/*.{js,mjs,cjs}";
```

Without `@source`, fixed widths (`w-[7ch]`, `size-6`, …) never apply and
toolbar controls stay content-sized.

**Prefer the purge-proof `style` tokens** when hosting under a foreign Tailwind
app: `PDF_ZOOM_PERCENT_BUTTON_STYLE`, `PDF_ZOOM_STEP_BUTTON_STYLE`,
`PDF_FIT_CYCLE_BUTTON_STYLE`, `FIND_BAR_MATCH_COUNT_STYLE`. These set
`width` / `fontVariantNumeric: "tabular-nums"` / monospace inline so ##% vs
###% cannot jump even if utilities are purged.
