const globals = require("globals");

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react-hooks/recommended"
    ],
    plugins: ["react-refresh"],
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    }
  },
  {
    ignores: ["dist", ".eslintrc.cjs"]
  }
];