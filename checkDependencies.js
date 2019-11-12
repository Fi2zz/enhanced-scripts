const getApplications = require("./getApplications");
const path = require("path");
const spawn = require("cross-spawn");
const utils = require("./utils");
const fs = require("fs-extra");
const resolve = require("./config/resolve");
function checkPackageOtherDeps(package, name) {
  //ignore all following dependencies
  const ignoredDependencies = Object.keys(package).filter(item => {
    item = item.toLowerCase();
    return item.includes("dependencies") && item !== "dependencies";
  });
  if (ignoredDependencies.length > 0) {
    throw Error(
      name +
        " package.json should not have `[" +
        ignoredDependencies.join("`,`") +
        "`],put all dependencies to `package.dependencies`"
    );
    process.exit(1);
  }
}
async function checkDependencies(script) {
  const isBuildScript = script === "build";
  return getApplications(script).map(async entry => {
    const pkg = entry.replace("index.js", "package.json");
    const package = require(pkg);
    const name = resolve.basename(entry);
    utils.info(`Check dependencies of ${name}  `);
    checkPackageOtherDeps(package, name);
    await removeNodeModules(isBuildScript, entry);
    await installDependencies(package, entry, isBuildScript);
    return entry;
  });
}
async function removeNodeModules(shouldRemove, entry) {
  if (shouldRemove) {
    try {
      const node_modules = entry.replace("index.js", "node_modules");
      utils.info(`Remove ${node_modules}`);
      fs.removeSync(node_modules);
    } catch (error) {}
  }
}

/**
 *
 * @param {*} package
 * @param {*} entry
 * @param {*} isBuildScript
 */
async function installDependencies(package, entry, isBuildScript) {
  const deps = [];
  const hasDependencies = !!package.dependencies;
  if (!hasDependencies) {
    return Promise.resolve();
  }
  const resolveApp = (p = "") => entry.replace("index.js", p);
  const name = resolve.basename(entry);
  const resolveNodeModules = dep =>
    path.resolve(resolveApp("node_modules"), dep);
  const dependencies = package.dependencies;
  utils.info(`Collecting dependencies of ${name}`);
  for (let dep in dependencies) {
    const packageVersion = `${dependencies[dep]}`.replace(/^\D/, "").trim();
    //for dev , just check deps in app own node_modules;
    if (isBuildScript || !utils.dryRequire(resolveNodeModules(dep))) {
      deps.push(`${dep}@${packageVersion}`);
    }
  }
  if (deps.length > 0) {
    const installed = await install(deps, resolveApp());
    utils.info(installed);
  }
  return Promise.resolve();
}
function install(deps, cwd) {
  utils.info(`Installing dependencies of ${cwd}`);
  return new Promise((resolve, reject) => {
    let args;
    // yarn use --cwd
    // npm use --prefix
    if (utils.useYarn) {
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
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("close", code => {
      if (code !== 0) {
        reject(`${command} ${args.join(" ")}`);
        throw Error("Failed to install dependencies at " + cwd);
        return;
      }
      resolve("Dependencies of " + cwd + " installed");
    });
  });
}
exports = module.exports = checkDependencies;
exports.install = install;
