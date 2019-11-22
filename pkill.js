const child_process = require("child_process");
const path = require("path");
module.exports = function(filename) {
  const dirname = path.dirname(filename);
  const basename = path.basename(dirname);
  const file = path.basename(filename);
  const script = path.join(basename, file);
  try {
    const pkill = child_process.spawn("pkill", ["-f", script]);
    pkill.stderr.on("data", data => {});
    pkill.on("close", code => {
      pkill.kill(0);
    });
  } catch (error) {
    console.log(error);
  }
};
