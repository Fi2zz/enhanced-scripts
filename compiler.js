process.on("unhandledRejection", (err) => {
  if (err.name && err.name !== "compile_error") {
    throw err;
  }
});
const webpack = require("webpack");
const printBuildInfo = require("./printStats");
const formatWebpackMessages = require("./formatWebpackMessages");
const MultiStats = require("webpack/lib/MultiStats");
function statsToJson(stats) {
  const mapped = stats.map((stat) =>
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

module.exports = async function(config) {
  let err, stat;
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
    stat = await runCompiler(runner, options);
  } catch (error) {
    if (error.name == "WebpackOptionsValidationError") {
      throw error;
    } else {
      error.name = "compile_error";
    }
    err = error;
  }
  printBuildInfo(stat, err, null);
  return [err, stat];
};

function buildCompilerError(error) {
  return {
    errors: [error.message],
    warnings: []
  };
}

function runCompiler(compiler, options) {
  return new Promise((resovle, reject) => {
    const callback = (error, stat) => {
      let stats = [];
      let messages;
      let isCompileError = false;
      if (error) {
        if (!error.message) {
          return reject(error);
        }
        messages = formatWebpackMessages(buildCompilerError(error), false);
      } else {
        if (stat instanceof MultiStats) {
          stats = stat.stats;
        } else {
          stats = [stat];
        }
        isCompileError = true;
        messages = formatWebpackMessages(statsToJson(stats), true);
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        error = new Error(messages.errors.join("\n\n"));
        if (isCompileError) {
          error.name = "compile_error";
        }
      }
      error ? reject(error) : resovle(stats);
    };
    if (options) {
      compiler(options, callback);
    } else {
      compiler(callback);
    }
  });
}
