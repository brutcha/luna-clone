module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      // TODO: check if this plugin is needed in production
      ...(process.env.NODE_ENV !== "production"
        ? ["babel-plugin-transform-vite-meta-env"]
        : []),
    ],
  };
};
