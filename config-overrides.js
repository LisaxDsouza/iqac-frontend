module.exports = function override(config, env) {
  if (config.devServer) {
    config.devServer.allowedHosts = "all"; // ✅ fix allowedHosts bug
  }
  return config;
};
