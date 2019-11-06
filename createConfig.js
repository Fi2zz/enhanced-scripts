const _ = require("lodash");
const configFactory = require("./config/webpack.config");
const merge = require("webpack-merge");
const utils = require("./utils");
const paths = require("./config/paths");

/**
 *
 * @param {*} file
 * @param {*} mode
 */
function getWebpackConfig(file, mode) {
  if (!utils.dryRequire(file)) {
    return {};
  }
  try {
    return require(file)(mode);
  } catch (error) {
    return {};
  }
}

function deleteWebpackConfigItem(config, key) {
  if (_.isPlainObject(config) && config[key]) {
    delete config[key];
  }
}
function getWebpackMouleRules(config) {
  let rules = _.get(config, "module.rules", []);
  let oneOfIndex = _.findIndex(rules, "oneOf");
  let rule = [];
  if (oneOfIndex >= 0) {
    const oneOf = rules[oneOfIndex];
    if (_.isArray(oneOf)) {
      rule = oneOf;
    }
    //remove oneof
    rules = rules.filter((item) => !item.oneOf);
  }
  return [...rule, ...rules];
}

function buildOneOfRules(defaults, ..._rules) {
  const rules = _rules.reduce((acc, rules) => {
    acc = [...acc, ...rules];
    return acc;
  }, []);
  defaults.module.rules.push({
    oneOf: rules
  });
}

function createConfig(mode, app) {
  const rootWebpackConfig = getWebpackConfig(paths.appWebpackConfig, mode);
  const appWebpackConfig = getWebpackConfig(app.webpackConfig, mode);
  const defaults = configFactory(mode, {
    entry: app.entry
  });
  //<project>/webpack.config.js
  deleteWebpackConfigItem(rootWebpackConfig, "entry");
  deleteWebpackConfigItem(rootWebpackConfig, "output");
  deleteWebpackConfigItem(rootWebpackConfig, "devServer");

  //<project>/apps/<app>/webpack.config.js
  deleteWebpackConfigItem(appWebpackConfig, "output");
  deleteWebpackConfigItem(appWebpackConfig, "entry");
  deleteWebpackConfigItem(appWebpackConfig, "devServer");

  return mergeConfig(defaults, rootWebpackConfig, appWebpackConfig);
}

function mergeConfig(
  defaults,
  rootWebpackConfig,
  appWebpackConfig,
  extraWebpackConfig = {}
) {
  //[{parser: {requireEnsure: false}},{oneOf:[]}]
  const oneOfRules = defaults.module.rules.pop();
  const defaultOneOfRules = oneOfRules.oneOf;
  const fileLoader = defaultOneOfRules.pop();
  buildOneOfRules(
    defaults,
    defaultOneOfRules,
    getWebpackMouleRules(rootWebpackConfig),
    getWebpackMouleRules(appWebpackConfig),
    [fileLoader]
  );
  //delete rules of root and app webpack config
  deleteWebpackConfigItem(rootWebpackConfig.module, "rules");
  deleteWebpackConfigItem(appWebpackConfig.module, "rules");
  return merge(
    defaults,
    rootWebpackConfig,
    appWebpackConfig,
    extraWebpackConfig
  );
}
exports = module.exports = createConfig;
exports.buildOneOfRules = buildOneOfRules;
exports.getWebpackMouleRules = getWebpackMouleRules;
exports.getWebpackConfig = getWebpackConfig;
exports.deleteWebpackConfigItem = deleteWebpackConfigItem;
exports.mergeWebpackConfigs = mergeConfig;
