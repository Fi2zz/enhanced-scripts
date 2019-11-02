process.on("unhandledRejection", err => {
  if (err.name && err.name !== "compile_error") {
    throw err;
  }
});

const isInteractive = process.stdout.isTTY;
const printBuildInfo = require("./printFormattedWebpackMessages");
const webpack = require("webpack");
const formatWebpackMessages = require("./formatWebpackMessages");
const MultiStats = require("webpack/lib/MultiStats");
const clearConsole = require("react-dev-utils/clearConsole.js");
function statsToJson(stats) {
  const mapped = stats.map(stat =>
    stat.toJson({
      all: false,
      warnings: false,
      errors: true
    })
  );
  return statsCombine(mapped);
  function statsCombine(stats) {
    return stats.reduce(
      (acc, stat) => {
        acc.errors = [...acc.errors, ...stat.errors];
        acc.warnings = [...acc.warnings, ...stat.warnings];
        return acc;
      },
      {
        errors: [],
        warnings: []
      }
    );
  }
}

module.exports = async function makeCompile(config) {
  try {
    const compiler = webpack(config);
    let options = null;
    let runner = null;
    if (Array.isArray(config)) {
      runner = compiler.watch.bind(compiler);
      options = {};
    } else {
      runner = compiler.run.bind(compiler);
    }
    const stats = await createCompiler(runner, options);
    return [null, stats];
  } catch (error) {
    return [error, null];
  }
};

function compilerError(error) {
  return {
    errors: [error.message],
    warnings: []
  };
}

function createCompiler(compilerRunner, options) {
  return new Promise((resovle, reject) => {
    const callback = (error, stat) => {
      let stats = [];

      if (isInteractive) {
        clearConsole();
      }
      let messages;
      if (error) {
        if (!error.message) {
          return reject(error);
        }
        messages = formatWebpackMessages(compilerError(error));
      } else {
        if (stat instanceof MultiStats) {
          stats = stat.stats;
        } else {
          stats = [stat];
        }
        messages = statsToJson(stats);
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        error = new Error(messages.errors.join("\n\n"));
      }
      if (error && error.name !== "WebpackOptionsValidationError") {
        error.name = "compile_error";
      }
      printBuildInfo(stats, error, null);
      error ? reject(error) : resovle(stat);
    };
    if (options) {
      compilerRunner(options, callback);
    } else {
      compilerRunner(callback);
    }
  });
}
