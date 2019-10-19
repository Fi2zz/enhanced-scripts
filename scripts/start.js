process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";
const checkDependencies = require("../checkDependencies");
const compile = require("../createCompiler");
const createConfig = require("../createConfig");
const utils = require("../utils");
const copyAssets = require("../copyAssets");
const watcher = require("../watcher");
const path = require("path");
const paths = require("../config/paths");
const { makeBuildDirectory } = require("../makeBuildDirectory");
require("../config/env");

checkDependencies("start").then(async apps => {
  makeBuildDirectory();
  let applications = await Promise.all(apps);
  applications = applications.map(app => ({
    config: createConfig("development", app),
    dir: path.dirname(app.entry),
    name: path.basename(path.dirname(app.entry))
  }));
  const findConfig = name => applications.find(item => item.dir === name);
  const source = paths.config.src;
  const watchedDirectories = applications.map(item => item.dir);
  watcher({
    dirs: watchedDirectories,
    onChange: async changedFile => {
      const filename = changedFile.split("apps").pop();
      const appDir = path.join(source, path.dirname(filename));
      const current = findConfig(appDir);
      if (current) {
        await makeCompile(current.config, current.name);
      }
    }
  });

  async function makeCompile(config, name) {
    try {
      name = name || null;
      await compile(config, true);
      utils.ok("Watching files");
      copyAssets({
        mode: "development",
        firstCompilation: name === null,
        name: name
      });
    } catch (error) {
      Promise.reject(error);
    }
  }
  function createInitCompilation() {
    let compilations = 0;
    let hasFailedJob = false;
    applications.forEach(async ({ config, dir }, _, applications) => {
      utils.info("Compiling `" + path.basename(dir) + "`");
      try {
        await compile(config, true);
      } catch (error) {
        hasFailedJob = true;
        Promise.reject(error);
      }
      compilations += 1;
      if (compilations === applications.length) {
        if (!hasFailedJob) {
          copyAssets({
            mode: "development",
            firstCompilation: true,
            name: null
          });
          utils.ok("Watching files");
        } else {
          utils.print(utils.chalk.red("Watching files"));
        }
      }
    });
  }
  createInitCompilation();
});
