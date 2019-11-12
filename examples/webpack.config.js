module.exports = function() {
  return {};
};

exports = module.exports;

exports.babel = () => ({
  presets: ["@babel/env"]
});
exports.postcss = () => ({
  plugins: () => [
    // require("postcss-svg")({}),
    // require("postcss-aspect-ratio-mini")({}),
    // require("postcss-write-svg")({utf8: false}),
    require("postcss-px-to-viewport")({
      unitToConvert: "px",
      viewportWidth: 750,
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
      landscapeWidth: 666
    })
  ]
});
