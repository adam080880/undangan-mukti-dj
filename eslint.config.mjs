import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      "semi": ["error", "always"],
      "no-eval": "error",
      "curly": ["error", "all"],
      "no-unused-vars": ["error", { "args": "none" }],
      "eqeqeq": ["error", "always"],
      "no-undef": "error",
      "no-debugger": "error",
      "consistent-return": "error",
      "no-implicit-globals": "error",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-redeclare": "error",
      "no-return-await": "error",
      "no-shadow": "error",
      "no-self-compare": "error",
      "no-unreachable": "error",
      "no-var": "error",
      "no-constant-condition": "error",
      "prefer-const": "error",
      "no-use-before-define": "error",
      "no-duplicate-imports": "error",
      "no-template-curly-in-string": "error",
      "require-await": "error",
      "no-else-return": "error",
      "no-floating-decimal": "error",
      "no-nested-ternary": "warn",
    },
  },
];