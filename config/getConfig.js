const _ = require("lodash");
const yaml = require("yaml");
const yarg = require("yargs");
const fs = require("fs");
const path = require("path");
const { resolveApp } = require("./resolve");
const sourcePath = require("./sourcePath");
const withAppSrc = (...p) => resolveApp(sourcePath, ...p);
const appPackageJson = resolveApp("package.json");
function getAppBuildConfigFile() {
  const useBuildConfig = _.get(yarg.argv, "useConfig", null);
  return useBuildConfig &&
    (useBuildConfig.endsWith(".yml") || useBuildConfig.endsWith(".yaml"))
    ? resolveApp(useBuildConfig)
    : null;
}
function getIgnoredPaths() {
  const json = require(appPackageJson);
  return (json.ignored_paths || []).map(p => withAppSrc(p, "package.json"));
}

const configFile = getAppBuildConfigFile();
module.exports = function() {
  let dist = _.get(yarg.argv, "dist", "build");
  let excludes = [];
  let cleanLastBuild = _.get(yarg.argv, "clean", false);
  let only = _.get(yarg.argv, "only", null);
  let generateSourceMap = _.get(yarg.argv, "sourceMap", true);
  if (configFile) {
    const json = yaml.parse(fs.readFileSync(configFile).toString());
    only = _.get(json, "only", null);
    excludes = _.get(json, "excludes", []).map(p =>
      withAppSrc(p, "package.json")
    );
    cleanLastBuild = _.get(json, "clean_last_build", true);
    generateSourceMap = _.get(json, "generate_source_map", true);
    dist = _.get(json, "dist", "build");
  }
  if (only) {
    only = withAppSrc(only, "package.json");
  }
  return {
    dist: resolveApp(dist),
    ignore: getIgnoredPaths(),
    only,
    excludes,
    configFile
  };
};
