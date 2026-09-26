import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

// The component uses hooks, so Next.js App Router needs this directive at the
// top of the bundle. Rollup drops directives found in source, so add it here.
const banner = '"use client";';
const external = [/^react($|\/)/, /^react-dom($|\/)/];

export default defineConfig([
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.js", format: "es", banner },
      { file: "dist/index.cjs", format: "cjs", banner, exports: "named" },
    ],
    external,
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        declaration: false,
        exclude: ["test/**"],
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.d.ts", format: "es" },
      { file: "dist/index.d.cts", format: "es" },
    ],
    external,
    plugins: [dts()],
  },
]);
