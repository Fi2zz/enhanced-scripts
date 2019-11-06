const getApplications = require("./getApplications");
const path = require("path");
const spawn = require("cross-spawn");
const utils = require("./utils");
const fs = require("fs-extra");
const ensureBuildDirectory = require("./ensureBuildDirectory");
async function checkDependencies(script) {
  ensureBuildDirectory(script);
  const isBuildScript = script === "build";
  return getApplications(script).map(async (application) => {
    const hasDependencies = !utils.isEmpty(application.package.dependencies);
    utils.info(`Check dependencies of ${application.dirname}  `);
    removeNodeModules(
      isBuildScript && hasDependencies,
      application.node_modules
    );
    const deps = !hasDependencies
      ? []
      : collectDependencies(
          application.package.dependencies,
          application.node_modules,
          isBuildScript
        );
    if (deps.length > 0) {
      const installed = await install(deps, application.dirname);
      utils.info(installed);
    }
    return application;
  });
}

/***
 * remove <src>/<app-name>/node_modules
 */

function removeNodeModules(shouldRemove, node_modules) {
  if (shouldRemove) {
    try {
      utils.info(`Remove ${node_modules}`);
      fs.removeSync(node_modules);
    } catch (error) {}
  }
}

/***
 * use `require.resolve` to check dependency is installed
 */
function collectDependencies(dependencies, modules, isBuildScript) {
  const deps = [];
  utils.info(`Collecting dependencies`);
  for (let dep in dependencies) {
    const packageVersion = `${dependencies[dep]}`.replace(/^\D/, "").trim();
    //for dev , just check deps in app own node_modules;
    if (isBuildScript || !utils.dryRequire(path.resolve(modules, dep))) {
      deps.push(`${dep}@${packageVersion}`);
    }
  }
  return deps;
}
function install(deps, cwd) {
  utils.info(`Installing dependencies of ${cwd}`);
  return new Promise((resolve, reject) => {
    let args;
    // yarn use --cwd
    // npm use --prefix
    if (utils.shouldUseYarn()) {
      command = "yarnpkg";
      args = ["add", ...deps, "--exact", "--cwd", cwd];
    } else {
      command = "npm";
      args = [
        "install",
        ...deps,
        "--prefix",
        cwd,
        "--save",
        "--save-exact",
        "--loglevel",
        "error"
      ];
    }
    const child = spawn(command, args);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(`${command} ${args.join(" ")}`);
        return;
      }
      resolve("Dependencies of " + cwd + " installed");
      child.kill(0);
    });
  });
}
exports = module.exports = checkDependencies;
exports.install = install;
