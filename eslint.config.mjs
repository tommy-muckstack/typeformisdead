import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({ baseDirectory: fileURLToPath(new URL(".", import.meta.url)) });

const config = [
  { ignores: [".next/**", "node_modules/**", "vendor/**", "test-results/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals"),
];

export default config;
