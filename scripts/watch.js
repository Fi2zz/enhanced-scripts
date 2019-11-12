process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";
const utils = require("../utils");
const checkDependencies = require("../checkDependencies");
const createConfig = require("../createConfig");
const formatBuildMessage = require("../formatBuildMessages");
const webpack = require("webpack");
checkDependencies("start").then(async apps => {
  const applications = await Promise.all(apps);
  const configs = applications.map(app => createConfig("development", app));
  const compiler = webpack(configs);
  compiler.watch({}, (err, stat) => {
    const [error, rawError, stats] = formatBuildMessage(err, stat);
    if (error) {
      if (rawError.shouldThrow) {
        throw rawError;
      } else {
        utils.fail(error);
        utils.fail("Watching files");
      }
    } else {
      utils.print(stats);
      utils.ok("Watching files");
    }
  });
});
