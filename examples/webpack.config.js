module.exports = function(webpackEnv) {
  return {
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.css$/,
              loader: "css-loader"
            }
          ]
        }
      ]
    }
  };
};
