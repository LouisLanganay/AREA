import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: tsParser,
      globals: globals.browser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin
    },
    rules: {
      "indent": ["error", 2],
      "semi": ["error", "always"],
      "no-var": "error",
      "prefer-arrow-callback": "error",
      "no-param-reassign": "error",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "no-implicit-globals": "error",
      "eqeqeq": "error",
      "block-spacing": "error",
      "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
      "no-trailing-spaces": "error",
      "no-multiple-empty-lines": ["error", { "max": 1 }],
      "semi-style": ["error", "last"],
      "eol-last": ["error", "always"],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "no-param-reassign": "off",
    },
  },
];
