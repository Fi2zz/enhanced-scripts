const EnhancedVueLoaderPlugin = require("./EnhancedVueLoaderPlugin");
module.exports = {
  createDevServerConfig: require("./createDevServerConfig"),
  installDependency: require("./checkDependencies").install,
  EnhancedVueLoaderPlugin
};
