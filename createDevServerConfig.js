const mode = "development";
const path = require("path");

const resolve = require("./config/resolve");

process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";
const createConfig = require("./createConfig");
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
  if (!config.entry.endsWith(".js")) {
    throw Error("`entry`option must be ends with `index.js`");
  }
  if (!config.output) {
    throw Error("webpack.config.js must have `output` option");
  }
  input.stats = {
    assets: true,
    all: false,
    errors: true,
    errorDetails: true
  };
  input.devServer.hot = input.devServer.hot || true;
  return createConfig("development", input, true);
}

module.exports = createDevServerConfig;
