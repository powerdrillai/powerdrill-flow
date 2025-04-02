import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-plugin-prettier";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintIgnore = [
  // build outputs
  "**/.next/**",
  "**/dist/**",
  "**/build/**",
  // dependencies
  "**/node_modules/**",
  // package manager
  "**/pnpm-lock.yaml",
  // cache
  "**/.cache/**",
  "**/.eslintcache",
  "**/.DS_Store",
  "**/*.pem",
  "**/npm-debug.log*",
  "**/yarn-debug.log*",
  "**/yarn-error.log*",
  "**/.pnpm-debug.log*",
  "**/backend/**",
];

const eslintConfig = [
  {
    ignores: eslintIgnore,
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      prettier,
      "simple-import-sort": eslintPluginSimpleImportSort,
    },
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": "off",
      "simple-import-sort/imports": "error", // Import configuration for `eslint-plugin-simple-import-sort`
      "simple-import-sort/exports": "error", // Export configuration for `eslint-plugin-simple-import-sort`
      "import/order": "off", // Avoid conflict rule between `eslint-plugin-import` and `eslint-plugin-simple-import-sort`
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];

export default eslintConfig;
