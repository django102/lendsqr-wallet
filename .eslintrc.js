module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    env: {
      amd: true,
      node: true,
      es6: true
    },
    ignorePatterns: ["node_modules", "build", "coverage"],
    plugins: ["@typescript-eslint", "import", "eslint-comments"],
    extends: [
      "eslint:recommended",
      "plugin:eslint-comments/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/typescript",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
      "import/order": ["error", { "newlines-between": "always", alphabetize: { order: "asc" } }],
      "sort-imports": ["error", { ignoreDeclarationSort: true, ignoreCase: true }],
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "spaced-comment": ["error", "always", { "markers": ["/"] }],
      "block-spacing": ["error", "always"],
      "comma-spacing": ["error", { "before": false, "after": true }],
      "no-multi-spaces": ["error", { "ignoreEOLComments": true }],
      "no-multiple-empty-lines": ["error", { "max": 2 }],
      "object-curly-spacing": ["error", "always"],
      "semi-spacing": ["error", { "before": false, "after": true }],
      "indent": ["error", 4, { "SwitchCase": 1 }],
      "space-before-function-paren": ["error", { "anonymous": "always", "named": "never", "asyncArrow": "always" }],
      "key-spacing": ["error", { beforeColon: false, afterColon: true, mode: "strict" }],
      "space-infix-ops": "error",
    },
  };
  