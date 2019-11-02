process.env.NODE_ENV = "production";
process.env.BABEL_ENV = "production";
const utils = require("../utils");
require("../config/env");
const checkDenpendencies = require("../checkDependencies");
const makeCompile = require("../createCompiler");
const copyAssets = require("../copyAssets");
const createConfig = require("../createConfig");
const {
  makeBuildDirectory,
  cleanBuildDirectory
} = require("../makeBuildDirectory");

checkDenpendencies("build").then(async applications => {
  makeBuildDirectory();
  cleanBuildDirectory();
  let compilations = 0;
  applications.forEach(async item => {
    const application = await item;
    utils.info("Start compile `" + application.name + "`");
    const config = createConfig("production", application);
    const [error, stats] = await makeCompile(config);
    if (error) {
      utils.fail(`Failed to compile ${application.name}`);
    } else {
      utils.ok("Compile  " + application.name + " successfully!");
    }
  });
});
