const fs = require("fs-extra");
const path = require("path");
const utils = require("../utils");
const sourcePath = require("./sourcePath");
const _ = require("lodash");
const { resolveApp, basename } = require("./resolve");
const getBuildConfig = require("./getConfig");
const appSrc = resolveApp(sourcePath);
const appPackageJson = resolveApp("package.json");

function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith("/");
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  } else {
    return inputPath;
  }
}
function getPublicPath() {
  const publicPath = require(appPackageJson).homepage || "/";
  return ensureSlash(publicPath, true);
}

const config = getBuildConfig(appSrc);

module.exports = {
  appPackageJson: appPackageJson,
  appSrc,
  appIndexJS: resolveApp(sourcePath, "index.js"),
  appBuild: resolveApp("build"),
  appNodeModules: resolveApp("node_modules"),
  appTsConfig: resolveApp("tsconfig.json"),
  appPath: resolveApp("."),
  servedPath: getPublicPath(appPackageJson),
  resolveApp: resolveApp,
  dotenv: resolveApp(".env"),
  extension: [
    "web.mjs",
    "mjs",
    "web.js",
    "js",
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "json",
    "web.jsx",
    "jsx",
    "vue"
  ],
  basename,
  config,
  configFile: config.configFile
};
