process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";
const checkDependencies = require("../checkDependencies");
const compile = require("../createCompiler");
const createConfig = require("../createConfig");
const utils = require("../utils");
const copyAssets = require("../copyAssets");
const path = require("path");
const { makeBuildDirectory } = require("../makeBuildDirectory");
require("../config/env");
checkDependencies("start").then(async apps => {
  makeBuildDirectory();
  const applications = await Promise.all(apps);
  const configs = applications.map(app => createConfig("development", app));
  const [error, stats] = await compile(configs);
  if (error) {
    utils.fail("Watching files");
  } else {
    utils.ok("Watching files");
  }
});
