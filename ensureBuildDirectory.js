const fs = require("fs-extra");
const utils = require("./utils");
const paths = require("./config/paths");
module.exports = function(script) {
  const buildFolder = paths.config.dist;
  try {
    if (!fs.existsSync(buildFolder)) {
      fs.ensureDirSync(buildFolder);
    } else {
      if (paths.config.cleanLastBuild) {
        utils.info(
          `Clean up build folder :${utils.chalk.green(
            buildFolder
          )} before run ${script}`
        );
        fs.emptyDirSync(buildFolder);
      }
    }
  } catch (err) {}
};
