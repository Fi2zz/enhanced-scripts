const fs = require("fs-extra");
const utils = require("./utils");
const paths = require("./config/paths");

function mkdir(buildFolder) {
  try {
    if (!fs.existsSync(buildFolder)) {
      fs.ensureDirSync(buildFolder);
    } else {
      if (paths.config.cleanLastBuild) {
        utils.info(`Clean up build folder :${buildFolder}`);
        fs.emptyDirSync(buildFolder);
      }
    }
  } catch (err) {}
}

module.exports = class EnsureOutputPathPlugin {
  constructor(enabled) {
    this.enabled = enabled;
  }
  apply(compiler) {
    if (!this.enabled) {
      return;
    }
    mkdir(compiler.options.output.path);
  }
};
