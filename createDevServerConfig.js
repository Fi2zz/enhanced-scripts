const mode = "development";

process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";

const _ = require("lodash");
const configFactory = require("./config/webpack.config");
const merge = require("webpack-merge");
const utils = require("./utils");
const paths = require("./config/paths");
const {
  getWebpackConfig,
  getWebpackModuleRules,
  buildOneOfRules,
  deleteWebpackConfigItem,
  mergeWebpackConfigs
} = require("./createConfig");
const rootWebpackConfig = getWebpackConfig(paths.appWebpackConfig, mode);
deleteWebpackConfigItem(rootWebpackConfig, "entry");
deleteWebpackConfigItem(rootWebpackConfig, "output");

function createDevServerConfig(input) {
  let config = input;
  if (typeof input === "function") {
    config = input(mode);
  }

  if (!config.devServer) {
    throw Error("webpack.config.js must have `devServer` option");
  }

  if (!config.entry) {
    throw Error("webpack.config.js must have `entry` option");
  }

  if (!config.output) {
    throw Error("webpack.config.js must have `output` option");
  }
  const defaults = configFactory(mode, {
    entry: null
  });
  return mergeWebpackConfigs(defaults, rootWebpackConfig, config, {
    stats: {
      assets: true,
      all: false,
      errors: true,
      errorDetails: true
    },
    devServer: {
      hot: true
    }
  });
}

module.exports = createDevServerConfig;
