import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import astro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  // Base ESLint recommended rules
  js.configs.recommended,

  // Astro recommended configuration
  ...astro.configs.recommended,

  // TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      semi: ["error", "always"],
      quotes: ["warn", "double", { allowTemplateLiterals: true }],
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },

  // Additional rules for Astro files
  {
    files: ["**/*.astro"],
    rules: {
      semi: ["error", "always"],
      quotes: ["warn", "double", { allowTemplateLiterals: true }],
      "no-useless-escape": "warn",
    },
  },

  // JavaScript files
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        require: "readonly",
        URL: "readonly",
        Response: "readonly",
      },
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["warn", "double", { allowTemplateLiterals: true }],
      "no-undef": "error",
    },
  },

  // TypeScript files for API routes (need browser globals)
  {
    files: ["src/pages/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        URL: "readonly",
        Response: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      semi: ["error", "always"],
      quotes: ["warn", "double", { allowTemplateLiterals: true }],
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },

  // JSX accessibility for React components
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },

  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".astro/**",
      "**/*.d.ts",
      "tailwind.config.mjs",
    ],
  },
];
