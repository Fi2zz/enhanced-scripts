const HtmlWebpackPlugin = require("html-webpack-plugin");

const path = require("path");
module.exports = () => {
  return {
    entry: path.resolve(__dirname, "./index.js"),
    output: {
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      filename: "[name].js"
    },
    devServer: {
      contentBase: path.resolve(__dirname, "public"),
      port: 4040
    }
  };
};
