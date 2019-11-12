const configFactory = require("./config/webpack.config");
const webpackMerge = require("webpack-merge");
const utils = require("./utils");
const paths = require("./config/paths");
const resolve = require("./config/resolve");
const RuleSet = require("webpack/lib/RuleSet");
const vueSupport = require("./vueSupport");
const isFn = v => typeof v === "function";
const path = require("path");
const webpackConfigFile = resolve.resolveApp("webpack.config.js");
const EnsureOutputPathPlugin = require("./EnsureOutputPathPlugin");
const _ = require("lodash");
/**
 *
 * @param {*} file
 * @param {*} mode
 */
function getWebpackConfig(file, mode) {
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

/**
 *
 * @param {*} config
 * @param {*} keys
 */
function deleteConfigKeys(config, keys = []) {
  if (keys.length <= 0) {
    return;
  }
  if (_.isPlainObject(config)) {
    Object.keys(config).forEach(key => {
      if (keys.includes(key)) {
        delete config[key];
      }
    });
  }
}

/**
 *
 * @param  {...any} config
 */
function combineRules(...config) {
  const flattenRules = config => {
    let rules = _.get(config, "module.rules", []);
    const oneOfRule = rules.find(item => item && item.oneOf);
    let flatten = rules.filter(item => item && !item.oneOf);
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
/**
 *
 * @param {*} defaults
 * @param {*} rules
 */
function addRules(defaults, rules) {
  if (!Array.isArray(rules)) {
    rules = [rules];
  }
  for (let loader of rules) {
    defaults.push(loader);
  }
}

function addPlugin(defaults, plugins) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }
  for (let plugin of plugins) {
    defaults.plugins.push(plugin);
  }
}

/**
 *
 * @param {*} config
 */
function clearRules(config) {
  if (config.module) {
    config.module.rules = [];
  }
}

/**
 *
 * @param {*} mode
 * @param {*} input
 */
function Config(input = {}, typescript) {
  const base = configFactory(input.mode, {
    tsConfig: typescript.tsConfig,
    typeScriptLocation: typescript.typeScriptLocation
  });
  base.entry = input.entry;
  base.output.path = path.resolve(paths.config.dist, input.name);
  return base;
}

/**
 *
 * @param {*} defaults
 * @param {*} project
 * @param {*} app
 * @param {*} extra
 */
function merge(defaults, project, app, extra) {
  //[{parser: {requireEnsure: false}},{oneOf:[]}]
  const combinedExternalRules = combineRules(project, app);
  let rules = defaults.module.rules;
  let { oneOf } = popRule(rules);
  const fileLoader = popRule(oneOf);
  addRules(oneOf, combinedExternalRules);
  if (extra.vueTemplateCompiler) {
    vueSupport(oneOf, defaults.plugins, extra.vueTemplateCompiler);
  }
  addRules(oneOf, fileLoader);
  addRules(rules, mapRules(oneOf, extra));
  clearRules(project);
  clearRules(app);
  return webpackMerge(defaults, project, app);
}

/**
 *
 * @param {*} rules
 * @param {*} param1
 * @return {*} {oneOf:[Array]}
 */

function mapRules(rules, { babel, postcss }) {
  const ruleSet = new RuleSet(rules).rules.map(rule => {
    if (rule.enforce) {
      return rule;
    }
    applyBabelLoaderOptions(rule, babel);
    applyPostCssLoaderOptions(rule, postcss);
    return rule;
  });
  return {
    oneOf: ruleSet
  };
}
/**
 *
 * @param {*} rule
 */
const loaderOptionsReducer = rule => {
  //acc => babel => {presets,plugins}
  //acc => postcss => {plugins}
  return (acc, config) => {
    for (let key in config) {
      if (key in acc) {
        const current = config[key];
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

/**
 *
 * @param {*} rule
 * @param {*} options
 */
function applyBabelLoaderOptions(rule, options) {
  const loader = findRule(rule, "babel-loader");
  if (!loader) {
    return;
  }
  //apply to first babel-loader, not the second
  //first babel-loader apply's to our source files
  if (!loader.options.plugins) {
    return;
  }
  const defaults = {
    presets: [],
    plugins: []
  };
  options = options.reduce(loaderOptionsReducer(rule), defaults);
  applyLoaderOption(loader, options);
}
/**
 *
 * @param {*} rule
 * @param {*} options
 */
function applyPostCssLoaderOptions(rule, options) {
  const loader = findRule(rule, "postcss-loader");
  if (!loader) {
    return;
  }

  const assertPostcssPlugins = plugins => {
    if (!isFn(plugins)) {
      throw Error("Postcss plugins should be a facotry which returns an array");
    }
  };
  options = options
    .map(item => {
      assertPostcssPlugins(item.plugins);
      return item;
    })
    .reduce(loaderOptionsReducer(rule), {
      plugins: loader.options.plugins
    });
  applyLoaderOption(loader, options);
}

function findRule(rule, loader) {
  return rule.use.find(({ loader: l }) => l.includes(loader));
}

/**
 *
 * @param {*} loader
 * @param {*} options
 */
function applyLoaderOption(loader, options) {
  const loaderOptions = loader.options;
  for (let key in loaderOptions) {
    let configs = options[key];
    if (configs) {
      if (_.isArray(configs)) {
        loaderOptions[key] = loaderOptions[key].concat(configs);
      } else {
        loaderOptions[key] = configs;
      }
    }
  }
}

function getExtraConfig(project, _app, _mode) {
  const extra = {
    vueTemplateCompiler: project.vueTemplateCompiler || _app.vueTemplateCompiler
  };
  extra.babel = [project.babel, _app.babel].filter(isFn).map(fn => fn(_mode));
  //app > root
  extra.postcss = [_app.postcss, project.postcss]
    .filter(isFn)
    .map(fn => fn(_mode));
  return extra;
}

const project = getWebpackConfig(webpackConfigFile);

/**
 *
 * @param {*} mode
 * @param {*} app
 */
function createConfig(mode, app) {
  const useDevServer = typeof app !== "string";
  const entry = useDevServer ? app.entry : app;
  const replaceEntryWith = p => entry.replace("index.js", p);
  if (!useDevServer) {
    const configFile = replaceEntryWith("webpack.config.js");
    app = getWebpackConfig(configFile, mode);
  }
  const typeScriptLocation = replaceEntryWith("node_modules");
  const tsConfig = replaceEntryWith("tsconfig.json");
  const basic = {
    name: resolve.basename(entry),
    entry,
    mode
  };
  const typescript = {
    typeScriptLocation,
    tsConfig
  };

  const defaults = new Config(basic, typescript);

  addPlugin(defaults, [new EnsureOutputPathPlugin(!useDevServer)]);
  const extra = getExtraConfig(project, app, mode);
  deleteConfigKeys(project, [
    "babel",
    "entry",
    "output",
    "postcss",
    "vueTemplateCompiler",
    "mode"
  ]);
  deleteConfigKeys(app, ["babel", "postcss", "mode", "vueTemplateCompiler"]);
  deleteConfigKeys(app.output, ["filename"]);
  return merge(defaults, project, app, extra);
}
module.exports = createConfig;
