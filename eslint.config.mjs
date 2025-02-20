import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config} */
export default {
  files: ["**/*.js"],  // Target JavaScript files
  languageOptions: {
    sourceType: "script",  // Treat the source as script (can switch to 'module' for ES6+ modules)
    globals: globals.browser,  // Define global variables (e.g., for browser)
  },
  plugins: "prettier",  // Use Prettier plugin for ESLint
  extends: [
    "eslint:recommended",           // Use ESLint's recommended rules
    "plugin:prettier/recommended"   // Integrate Prettier's recommended settings
  ],
  rules: {
    "prettier/prettier": "error",   // Treat Prettier formatting issues as errors
    "max-len": ["error", { "code": 1000 }]  // Allow lines up to 1000 characters (adjust if needed)
  },
  ...pluginJs.configs.recommended,  // Use the recommended ESLint config for JavaScript
};
