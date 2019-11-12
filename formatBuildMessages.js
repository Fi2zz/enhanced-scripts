process.on("unhandledRejection", err => {
  if (err.name && err.name !== "compile_error") {
    throw err;
  }
});
const chalk = require("chalk");
const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");
const utils = require("./utils");
const path = require("path");
const paths = require("./config/paths");
const prettyBytes = require("pretty-bytes");
const stripAnsi = require("strip-ansi");
function canReadAsset(asset) {
  return (
    /\.(js|css)$/.test(asset) &&
    //source map file
    !/\.map$/.test(asset) &&
    !/service-worker\.js$/.test(asset) &&
    !/assets-manifest\.json$/.test(asset) &&
    !/precache-manifest\.[0-9a-f]+\.js$/.test(asset)
  );
}
const MultiStats = require("webpack/lib/MultiStats");

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

function buildCompilerError(error) {
  return {
    errors: [error.message],
    warnings: []
  };
}

const formatBuildMessage = (error, stat) => {
  let stats = [];
  let messages;
  let isCompileError = false;
  if (error) {
    if (!error.message) {
      return [error, null];
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
    } else {
    }
    error.shouldThrow = !isCompileError;
  }
  return [formatBuildError(error), error, formatBuildAssets(stats)];
};

function formatBuildError(error) {
  if (error) {
    const message = error != null && error.message;
    const stack = error != null && error.stack;
    if (
      stack &&
      typeof message === "string" &&
      (message.indexOf("from Terser") !== -1 ||
        message.indexOf("TS18003") !== -1)
    ) {
      // Add more helpful message for Terser error
      if (message.indexOf("from Terser") !== -1) {
        try {
          const matched = /(.+)\[(.+):(.+),(.+)\]\[.+\]/.exec(stack);
          if (!matched) {
            throw new Error("Using errors for control flow is bad.");
          }
          const problemPath = matched[2];
          const line = matched[3];
          const column = matched[4];
          return (
            "Failed to minify the code from this file: \n\n",
            chalk.yellow(
              `\t${problemPath}:${line}${column !== "0" ? ":" + column : ""}`
            ),
            "\n"
          );
        } catch (ignored) {
          return "Failed to minify the bundle." + error;
        }
      }
      //TS18003
      if (message.indexOf("TS18003") !== -1) {
        return (
          "You are using typescript,but no .ts files found in " +
          chalk.yellow(paths.appSrc) +
          " " +
          chalk.underline("TS18003")
        );
      }
    } else {
    }
    return message || error;
  }
  return null;
}

function formatAssets(stats) {
  return stats
    .toJson({ all: false, assets: true })
    .assets.filter(asset => canReadAsset(asset.name));
}
function formatBuildAssets(stats) {
  const formatAssetsPath = (stats, assetName) => {
    const ps = stats.compilation.compiler.options.output.path.split(path.sep);
    const sliced = ps.slice(ps.length - 2);
    return path.join(...sliced, assetName);
  };

  const mapDisplayAssets = longestSizeLabelLength => {
    return item => {
      let sizeLabel = item.size;
      const sizeLength = stripAnsi(sizeLabel).length;
      if (sizeLength < longestSizeLabelLength) {
        const rightPadding = " ".repeat(longestSizeLabelLength - sizeLength);
        sizeLabel += rightPadding;
      }
      return `${sizeLabel} ${chalk.green(item.name)} `;
    };
  };
  const formatDisplayAssets = stats => {
    return asset => {
      const name = formatAssetsPath(stats, asset.name);
      const size = prettyBytes(asset.size).replace(/\s/g, "");
      return { name, size };
    };
  };
  const assets = stats
    .map(stats => formatAssets(stats).map(formatDisplayAssets(stats)))
    .reduce((single, all) => all.concat(single), [])
    .sort((a, b) => b.size - a.size);
  const longestSizeLabelLength = Math.max.apply(
    null,
    assets.map(a => stripAnsi(a.size).length)
  );
  return assets.map(mapDisplayAssets(longestSizeLabelLength)).join("\n");
}
module.exports = formatBuildMessage;
