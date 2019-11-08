process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";
const checkDependencies = require("../checkDependencies");
const compile = require("../compiler");
const createConfig = require("../createConfig");
const utils = require("../utils");
require("../config/env");
const printBuildInfo = require("../printStats");
checkDependencies("start").then(async (apps) => {
  const applications = await Promise.all(apps);
  const configs = applications.map((app) => createConfig("development", app));
  await compile(configs, {}, (error, stats) => {
    printBuildInfo(stats, error, null);
    if (error) {
      utils.fail("Watching files");
    } else {
      utils.ok("Watching files");
    }
  });
});
