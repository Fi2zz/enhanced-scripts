const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
//引入`enhanced-scripts` 的 `createDevServerConfig`函数
const createDevServerConfig = require("enhanced-scripts").createDevServerConfig;
//引入`webpack.config.js`
const webpackConfig = require(path.resolve(__dirname, "./webpack.config.js"));
//导出 devServer配置
// module.exports =
const config = webpackConfig("development");
if (!Array.isArray(config.plugins)) {
  config.plugins = [];
}
config.plugins.push(
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "public/index.html")
  })
);
module.exports = createDevServerConfig(config);
