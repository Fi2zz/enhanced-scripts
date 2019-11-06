// const vueLoader = require.resolve("./node_modules/"); //.replace('');

// console.log("vueloader", vueLoader);

const path = require("path");
const cwd = process.cwd();
const node_modules = (...els) => path.resolve(cwd, "node_modules", ...els);
const EnhancedVueLoaderPlugin = require("enhanced-scripts")
  .EnhancedVueLoaderPlugin;
module.exports = () => {
  return {
    output: {
      path: path.resolve(__dirname, "hello"),
      filename: "test.js"
    },
    plugins: [
      new EnhancedVueLoaderPlugin(
        require.resolve(path.resolve(__dirname, "node_modules/vue-loader"))
      )
    ],
    resolve: {
      extensions: [".vue"]
    },
    module: {
      rules: [
        {
          test: /\.vue/,
          loader: require.resolve("vue-loader")
        }
      ]
    }
  };
};
