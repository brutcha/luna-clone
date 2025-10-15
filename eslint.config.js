// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/**/*", "node_modules/**/*"],
    rules: {
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    },
  },
]);
