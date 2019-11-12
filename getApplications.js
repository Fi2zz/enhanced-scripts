const glob = require("glob");
const paths = require("./config/paths");
const utils = require("./utils");
function filterBuildExcludedPackages(packages) {
  const excludes = paths.config.excludes;
  if (excludes.length > 0) {
    const displayExcludes = excludes
      .map(item => `       ${item.replace("package.json", "")}`)
      .join("\n");
    utils.warn(`These Applications will not be compiled:\n${displayExcludes}`);
    return packages.filter(package => !excludes.includes(package));
  }
  return packages;
}
function filterBuildIgnoredPackage(packages) {
  const ignore = paths.config.ignore;
  if (ignore.length > 0) {
    utils.warn(
      `These packages will not be resovled as webpack entry but still will be compiled:\n${ignore
        .map(item => `       ${item.replace("package.json", "")}`)
        .join("\n")}`
    );
    return packages.filter(package => !ignore.includes(package));
  }
  return packages;
}
function filterBuildOnlyPackage(packages) {
  utils.warning(
    `Build application only: ${paths.config.only.replace("package.json", "")}`
  );
  return packages.filter(package => paths.config.only === package);
}
function createApplications(packages) {
  return packages.map(package => package.replace("package.json", "index.js"));
}
module.exports = function getApplications() {
  utils.info("Read all `package.json` from " + paths.appSrc);
  if (paths.configFile) {
    utils.info(`Using build config file: ${paths.configFile}`);
  }
  let packages = glob.sync(`${paths.appSrc}/*/package.json`).sort();
  if (!paths.config.only) {
    packages = filterBuildIgnoredPackage(packages);
    packages = filterBuildExcludedPackages(packages);
  } else {
    packages = filterBuildOnlyPackage(packages);
  }
  packages = createApplications(packages);
  return packages;
};
