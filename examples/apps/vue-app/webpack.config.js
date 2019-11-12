const path = require("path");
module.exports = function config() {
  return {
    entry: path.resolve(__dirname, "index.js"),
    output: {
      path: path.resolve(__dirname, "build_vue_app"),
      filename: "test.js",
      publicPath: "/vue-app/"
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.css$/,
              loader: "vue-style-loader"
            }
          ]
        },
        {
          test: /\.scss$/,
          loader: "vue-style-loader"
        }
      ]
    }
  };
};

exports = module.exports;
exports.babel = () => ({
  plugins: []
  // presets: ["@babel/env"]
});
exports.vueTemplateCompiler = require("vue-template-compiler");
exports.postcss = () => ({
  plugins() {
    return [
      require("postcss-svg")({}),
      require("postcss-aspect-ratio-mini")({}),
      require("postcss-write-svg")({ utf8: false }),
      require("postcss-px-to-viewport")({
        unitToConvert: "px",
        viewportWidth: 1000,
        unitPrecision: 5,
        propList: ["*"],
        viewportUnit: "vw",
        fontViewportUnit: "vw",
        selectorBlackList: [],
        minPixelValue: 1,
        mediaQuery: true,
        replace: true,
        exclude: [/gondola_main.scss/],
        landscape: false,
        landscapeUnit: "vw",
        landscapeWidth: 568
      })
    ];
  }
});
