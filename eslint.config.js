// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const reactCompiler = require("eslint-plugin-react-compiler");

module.exports = defineConfig([
  ...expoConfig.map((config) => {
    if (config.files && config.files.includes("**/*.ts")) {
      return {
        ...config,
        rules: {
          ...config.rules,
          "@typescript-eslint/array-type": [
            "error",
            { default: "array-simple" },
          ],
        },
      };
    }

    return config;
  }),
  reactCompiler.configs.recommended,
  {
    ignores: ["dist/*", ".expo/**/*", "node_modules/**/*"],
  },
]);
