const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
//引入`enhanced-scripts` 的 `createDevServerConfig`函数
const createDevServerConfig = require("enhanced-scripts").createDevServerConfig;
//引入`webpack.config.js`
const webpackConfig = require(path.resolve(__dirname, "./webpack.config.js"));


const 
//导出 devServer配置


const config = {
  mode: "development",
  entry: path.resolve(__dirname, "./index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    filename: "[name].js"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html")
    })
  ]
};
module.exports = createDevServerConfig(config);
