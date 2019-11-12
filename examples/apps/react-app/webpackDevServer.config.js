const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
//引入`enhanced-scripts` 的 `createDevServerConfig`函数
const createDevServerConfig = require("enhanced-scripts").createDevServerConfig;
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
      template: path.resolve(__dirname, "index.html")
    })
  ],
  devServer: {
    port: 3000
  }
};
module.exports = createDevServerConfig(config);
