const glob = require("glob");
const path = require("path");
const paths = require("./config/paths");
const utils = require("./utils");

function checkPackageOtherDeps(package) {
  const messages = [];

  //ignore all following dependencies
  const ignoredDependencies = Object.keys(package).filter((item) => {
    item = item.toLowerCase();
    return item.includes("dependencies") && item !== "dependencies";
  });
  if (ignoredDependencies.length > 0) {
    messages.push(
      "Invalid Package: package.json should not have `[" +
        ignoredDependencies.join("`,`") +
        "`],put all dependencies to `package.dependencies`"
    );
  }
  return messages;
}

function validatePackage(packageJson, entryIndexJS) {
  const messages = [];
  if (
    !utils.isPlainObject(packageJson) ||
    Object.keys(packageJson).length <= 0
  ) {
    messages.push(
      "Invalid Package: 'pacakge.json' is missing or 'package.json' invalid"
    );
    return messages;
  }
  if (!packageJson.name) {
    messages.push("Invalid Package: package should have the key `name`");
    return messages;
  }
  if (!utils.dryRequire(entryIndexJS)) {
    messages.push(`Invalid Package: Entry 'index.js' does not exist`);
    return messages;
  }
  return messages;
}
function filterBuildExcludedPackages(packages) {
  const excludes = paths.config.excludes;
  if (excludes.length > 0) {
    const displayExcludes = excludes.map((item) => `       ${item}`).join("\n");
    utils.warn(`These Applications will not be compiled:\n${displayExcludes}`);
    packages = packages.filter((app) => {
      return !excludes.includes(path.dirname(app));
    });
  }
  return packages;
}
function filterBuildIgnore(packages) {
  const ignore = paths.config.ignore;
  if (ignore.length > 0) {
    utils.warn(
      `These packages will not be resovled as webpack entry but still will be compiled:\n${ignore
        .map((item) => `       ${item.replace(/_/g, "/")}`)
        .join("\n")}`
    );
    packages = packages.filter((packagePath) => {
      let dirname = path
        .dirname(packagePath)
        .split("/")
        .join("_");
      return !ignore.includes(dirname);
    });
  }
  return packages;
}

function filterBuildOnlyPackages(packages) {
  if (paths.config.only) {
    utils.info(
      `Build application only: ${utils.chalk.yellow(paths.config.only)}`
    );
    packages = packages.filter((file) => {
      const {dir} = path.parse(file);
      const {base: applicationName} = path.parse(dir);
      return paths.config.only === applicationName;
    });
  }
  return packages;
}
function readPackages() {
  return glob.sync(`${paths.config.src}/*/package.json`).sort();
}
function filterValidPackages(packages) {
  return packages.filter((item) => item.errors.length <= 0);
}

function printPackageValidationError(pacakges) {
  pacakges.forEach((item) => {
    if (item.errors.length > 0) {
      item.errors = item.errors.map((item) => `[ERROR] ${item}`);
      item.errors.unshift(`Invalid Package: ${item.dirname}`);
      const error = item.errors.join("\n");
      utils.print();
      utils.error(`Skipping compile ${item.dirname}`);
      utils.error(error);
      utils.print();
    }
  });
}

function printPackageNoFoundError(packages, next) {
  if (packages.length <= 0) {
    utils.print();
    utils.error(
      "No validated packages found in " +
        utils.chalk.underline(paths.config.src)
    );
    utils.error(
      "A valid package should includes files `package.json` and `src/index.js`, \n" +
        "        package.json should includes key `name` and key `main`,\n" +
        "        value of `main` should be `index.js` "
    );
    next();
  }
}

function createApplications(packages) {
  return packages.map((packagePath) => {
    const package = require(packagePath);
    const applicationName = path.basename(path.dirname(packagePath));
    const applicationPath = (relativePath) =>
      path.resolve(
        paths.config.src,
        applicationName,
        relativePath ? relativePath : ""
      );
    const node_modules = applicationPath("node_modules");
    const entry = applicationPath("index.js");

    const validate = validatePackage(package, entry);
    const otherDeps = checkPackageOtherDeps(package);

    return {
      package: package,
      name: applicationName,
      entry,
      webpackConfig: applicationPath("webpack.config.js"),
      dirname: applicationPath(),
      node_modules,
      errors: otherDeps.concat(validate)
    };
  });
}

module.exports = function getApplications() {
  utils.info(
    "Read all `package.json` from " + utils.chalk.green(paths.config.src)
  );
  if (paths.config.file) {
    utils.info(`Using build config file: ${paths.config.file}`);
  }
  let packages = readPackages();
  packages = filterBuildOnlyPackages(packages);
  packages = filterBuildIgnore(packages);
  packages = filterBuildExcludedPackages(packages);
  packages = createApplications(packages);

  printPackageValidationError(packages);
  packages = filterValidPackages(packages);
  printPackageNoFoundError(packages, () => process.exit(1));
  return packages;
};
