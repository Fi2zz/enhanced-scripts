const fs = require("fs");
const path = require("path");
const appDirectory = fs.realpathSync(process.cwd());

const sourcePath = require("./sourcePath");
function basename(fileOrDirectory) {
  const stat = fs.statSync(fileOrDirectory);
  if (stat.isFile()) {
    const dirname = path.dirname(fileOrDirectory);
    return path.basename(dirname);
  }
  return path.basename(fileOrDirectory);
}

function resolveApp(...relativePath) {
  return path.resolve(appDirectory, ...relativePath);
}
function resolveAppSrc(_, __, elements) {
  return resolveApp(...[sourcePath, ...elements]);
}

function withSourcePath(...elements) {
  return resolveApp(sourcePath, ...elements);
}

module.exports = {
  resolveApp,
  resolveAppSrc,
  basename,
  appDirectory,
  withSourcePath
};
