const EnhancedVueLoaderPlugin = require("../../node_modules/enhanced-scripts/EnhancedVueLoaderPlugin");
const path = require("path");

const vueLoader = require.resolve("./node_modules/"); //.replace('');

console.log("vueloader", vueLoader);

module.exports = () => {
  return {
    webpack() {
      return {};
      // return {
      //   module: {
      //     rules: [
      //       {
      //         test: /\.vue$/,
      //         loader: "./node_modules/vue-loader"
      //       }
      //     ]
      //   },
      plugins: [new EnhancedVueLoaderPlugin(vueLoader)];
      // };
    }
  };
};
