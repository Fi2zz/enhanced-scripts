const VuePlugin = require("./EnhancedVueLoaderPlugin");
module.exports = function vueSupport(rules, plugins, vueTemplateCompiler) {
  if (!vueTemplateCompiler) {
    return;
  }
  rules.push({
    test: /\.vue$/,
    loader: require.resolve("vue-loader"),
    options: {
      compiler: vueTemplateCompiler
    }
  });
  plugins.push(new VuePlugin());
};
