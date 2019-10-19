const EnhancedVueLoaderPlugin = require("enhanced-scripts/EnhancedVueLoaderPlugin");
module.exports = () => {
  return {
    webpack() {
      return {
        resolve: {
          extensions: [".vue"]
        },
        module: {
          rules: [
            {
              test: /\.vue$/,
              loader: require.resolve("./apps/hello/node_modules/vue-loader")
            }
          ]
        },
        plugins: [
          new EnhancedVueLoaderPlugin(
            require.resolve("./apps/hello/node_modules/vue-loader")
          )
        ]
      };
    },
    postcss(postcss) {
      const result = {
        plugins: [
          () => () => {
            console.log("postcss plugin");
          }
        ],
        ...postcss
      };

      // console.log("example/webpack/postcss", result);
      return result;
      // return result;
    }
  };
};
