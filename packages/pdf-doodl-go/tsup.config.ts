import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "react",
    "react-dom",
    "react-pdf",
    "pdfjs-dist",
    "@n-uf/pdf-doodl",
    "@n-uf/pdf-doodl-react",
    "@n-uf/pdf-doodl-pdf-react",
    "@n-uf/pdf-doodl-pdf-react/components",
  ],
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
