import { defineConfig } from "eslint-define-config";
import js from "@eslint/js";

export default defineConfig([
  {
    ignores: ["dist/**"],
  },
  {
    files: ["**/*.js"],
    ...js.configs.recommended,
    rules: {
      // quotes: ["error", "single", { allowTemplateLiterals: true }],
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        globalThis: "readonly",
        MutationObserver: "readonly",
        fetch: "readonly",
        Event: "readonly",
        console: "readonly",
        navigator: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
  },
]);
