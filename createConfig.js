const _ = require("lodash");
const configFactory = require("./config/webpack.config");
const merge = require("webpack-merge");
const utils = require("./utils");
const paths = require("./config/paths");
const RuleSet = require("webpack/lib/RuleSet");
const vueSupport = require("./vueSupport");
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
    const imported = require(file);
    return Object.assign(imported(mode), {
      postcss: _.get(imported, "postcss", null),
      babel: _.get(imported, "babel", null),
      vueTemplateCompiler: _.get(imported, "vueTemplateCompiler", null)
    });
  } catch (error) {
    return {};
  }
}

function deleteConfigKeys(config, keys = []) {
  if (keys.length <= 0) {
    return;
  }
  if (_.isPlainObject(config)) {
    Object.keys(config).forEach((key) => {
      if (keys.includes(key)) {
        delete config[key];
      }
    });
  }
}

function combineRules(...config) {
  const flattenRules = (config) => {
    let rules = _.get(config, "module.rules", []);
    const oneOfRule = rules.find((item) => item && item.oneOf);
    let flatten = rules.filter((item) => item && !item.oneOf);
    if (oneOfRule) {
      flatten = flatten.concat(oneOfRule.oneOf);
    }
    return flatten;
  };
  return config.map(flattenRules).reduce((acc, rules) => {
    acc = acc.concat(rules);
    return acc;
  }, []);
}
function popRule(rules) {
  return rules.pop();
}
function addRules(defaults, rules) {
  if (!Array.isArray(rules)) {
    rules = [rules];
  }
  for (let loader of rules) {
    defaults.push(loader);
  }
}
function clearRules(config) {
  if (config.module) {
    config.module.rules = [];
  }
}

function mergeConfig(
  defaults,
  rootWebpackConfig,
  appWebpackConfig,
  extraWebpackConfig = {},
  extraConfig
) {
  //[{parser: {requireEnsure: false}},{oneOf:[]}]
  const combinedExternalRules = combineRules(
    rootWebpackConfig,
    appWebpackConfig
  );
  let rules = defaults.module.rules;
  let {oneOf} = popRule(rules);
  const fileLoader = popRule(oneOf);
  addRules(oneOf, combinedExternalRules);
  if (extraConfig.vueTemplateCompiler) {
    vueSupport(oneOf, defaults.plugins, extraConfig.vueTemplateCompiler);
  }
  addRules(oneOf, fileLoader);
  addRules(rules, mapRules(oneOf, extraConfig));
  clearRules(rootWebpackConfig);
  clearRules(appWebpackConfig);

  return merge(
    defaults,
    rootWebpackConfig,
    appWebpackConfig,
    extraWebpackConfig
  );
}

/**
 *
 * @param {*} rules
 * @param {*} param1
 * @return {*} {oneOf:[Array]}
 */

function mapRules(rules, {babel, postcss}) {
  const ruleSet = new RuleSet(rules).rules.map((rule) => {
    if (rule.enforce) {
      return rule;
    }
    ruleFinder(rule, {
      config: babel,
      loader: "babel-loader",
      defaults: {
        presets: [],
        plugins: []
      }
    });
    ruleFinder(rule, {
      config: postcss,
      loader: "postcss-loader",
      defaults: {
        plugins: []
      }
    });
    return rule;
  });
  return {
    oneOf: ruleSet
  };
}

function ruleFinder(rule, options) {
  const foundLoader = rule.use.find((rule) =>
    rule.loader.includes(options.loader)
  );
  const configReducer = (rule) => {
    return (acc, config) => {
      for (let key in config) {
        if (key in acc) {
          let current = config[key];
          if (Array.isArray(current)) {
            acc[key] = acc[key].concat(current);
          } else if (typeof current === "function") {
            acc[key] = acc[key].concat(current(rule));
          }
        }
      }
      return acc;
    };
  };
  const config = options.config.reduce(configReducer(rule), options.defaults);
  if (foundLoader && config) {
    const loaderOptions = foundLoader.options;
    for (let key in loaderOptions) {
      let configs = config[key];
      if (configs) {
        if (_.isArray(configs)) {
          loaderOptions[key] = loaderOptions[key].concat(configs);
        } else {
          loaderOptions[key] = configs;
        }
      }
    }
  }
}
function getConfig(config, mode) {
  const rootConfig = getWebpackConfig(paths.appWebpackConfig, mode);
  if (typeof config === "string") {
    config = getWebpackConfig(config, mode);
  }
  const extra = {
    babel: new Set([rootConfig.babel, config.babel]),
    postcss: new Set([config.postcss, rootConfig.postcss]),
    vueTemplateCompiler:
      rootConfig.vueTemplateCompiler || config.vueTemplateCompiler
  };
  deleteConfigKeys(rootConfig, [
    "babel",
    "entry",
    "output",
    "postcss",
    "vueTemplateCompiler"
  ]);
  deleteConfigKeys(config, ["babel", "postcss", "vueTemplateCompiler"]);
  return {
    root: rootConfig,
    app: config,
    extra: {
      babel: Array.from(extra.babel).filter((item) => !!item),
      postcss: Array.from(extra.postcss).filter((item) => !!item),
      vueTemplateCompiler: extra.vueTemplateCompiler
    }
  };
}
function createConfig(mode, input) {
  const {root: _root, app, extra} = getConfig(input.webpackConfig, mode);
  //<project>/webpack.config.js
  deleteConfigKeys(_root, ["devServer"]);
  //<project>/apps/<app>/webpack.config.js
  deleteConfigKeys(_root, ["entry", "output", "devServer"]);
  const base = configFactory(mode, {
    entry: input.entry
  });
  return mergeConfig(base, _root, app, {}, extra);
}
exports = module.exports = createConfig;
exports.mergeConfig = mergeConfig;
exports.deleteConfigKeys = deleteConfigKeys;
exports.getConfig = getConfig;
