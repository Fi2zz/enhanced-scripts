const chalk = require("chalk");
const _ = require("lodash");
const execSync = require("child_process").execSync;
const fs = require("fs-extra");
exports.warn = warning => exports.print(chalk.yellow("[WARN]", warning));
exports.info = info => exports.print(chalk.cyan("[INFO]", info));
exports.ok = msg => exports.print(chalk.green(msg));
exports.fail = msg => exports.print(chalk.red(msg));
exports.print = log =>
  console.log(log ? (Array.isArray(log) ? log.join("") : log) : "");
exports.dryRequire = function dryRequire(path) {
  try {
    require.resolve(path);
  } catch (error) {
    return false;
  }
  return true;
};
function shouldUseYarn() {
  try {
    execSync("yarnpkg --version", { stdio: "ignore", timeout: 300 });
    return true;
  } catch (e) {
    return false;
  }
}
exports.useYarn = shouldUseYarn();
