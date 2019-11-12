process.env.NODE_ENV = "production";
process.env.BABEL_ENV = "production";
const utils = require("../utils");
const checkDenpendencies = require("../checkDependencies");
const formatBuildMessage = require("../formatBuildMessages");
const createConfig = require("../createConfig");
const webpack = require("webpack");
const resolve = require("../config/resolve");

checkDenpendencies("build").then(async applications => {
  applications.forEach(async item => {
    const entry = await item;
    const name = resolve.basename(entry);
    utils.info("Start compile `" + name + "`");
    const config = createConfig("production", entry);
    const compiler = webpack(config);
    compiler.run((err, stat) => {
      const [error, rawError, stats] = formatBuildMessage(err, stat);
      if (error) {
        if (rawError.shouldThrow) {
          throw rawError;
        } else {
          utils.fail(error);
        }
        utils.fail("Failed to compile `" + name + "`");
      } else {
        utils.print(stats);
        utils.ok("Compile `" + name + "` successfully!");
      }
    });
  });
});
