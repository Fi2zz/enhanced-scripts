const mode = "development";

process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";
const _ = require("lodash");
const configFactory = require("./config/webpack.config");
const {mergeConfig, deleteConfigKeys, getConfig} = require("./createConfig");
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
  const {root: _root, app, extra} = getConfig(config, "development");
  return mergeConfig(
    configFactory("development", {entry: null}),
    _root,
    app,
    {
      stats: {
        assets: true,
        all: false,
        errors: true,
        errorDetails: true
      },
      devServer: {
        hot: true
      }
    },
    extra
  );
}

module.exports = createDevServerConfig;
