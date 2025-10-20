const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const { addLiveStoreDevtoolsMiddleware } = require("@livestore/devtools-expo");

const config = getDefaultConfig(__dirname);

if (process.env.NODE_ENV !== "production") {
  addLiveStoreDevtoolsMiddleware(config, {
    schemaPath: "./src/lib/livestore/schema.ts",
  });
}

module.exports = withNativewind(config, { inlineRem: 16 });
