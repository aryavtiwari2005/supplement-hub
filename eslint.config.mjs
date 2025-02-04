import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Warn on unused variables instead of error
      "no-console": "off", // Warn on console.log statements
      "react/prop-types": "off", // Disable prop-types rule for TypeScript projects
      "@typescript-eslint/no-explicit-any": "off", // Disable explicit any rule
    },
  },
];

export default eslintConfig;
