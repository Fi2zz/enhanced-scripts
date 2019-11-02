const Watchpack = require("watchpack");
const patterns = {
  node_modules: "node_modules/**",
  webpack: "webpack.config.js",
  postcss: "postcss.*",
  babel: "babel.*",
  yarn: "yarn.*",
  npm: "npm*"
};

const glob = require("glob");
module.exports = function watcher({ dirs, onChange, onAggregate }) {
  // dirs = dirs.filter(item => item.endsWith("src/"));

  console.log("watcher", dirs);

  const wp = new Watchpack({
    aggregateTimeout: 1000,
    ignored: [
      /\.lock$/,
      /\.log$/,
      /(^|[\/\\])\../,
      /package\.json/,
      /package-lock\.json/,
      /yarn\.lock/,
      /\.rc$/,
      /\.config/,
      /\.config\.js$/,
      /webpack\.config\.js$/,
      /babel\.config\.js$/,
      /postcss\.config\.js$/,
      /^npm/,
      /^yarn/,
      dirs
        .map(item => {
          let re = [];
          for (let key in patterns) {
            re.push(glob.sync(`${item}/${key}`));
          }

          console.log("ignore", re);
          return re;
        })
        .reduce((single, all) => all.concat(single), [])
    ],
    aggregateTimeout: 1000
  });
  wp.watch([], dirs, Date.now() - 10000);
  wp.on("change", onChange);
  wp.on("aggregated", onAggregate);
  return wp;
};

// class Watching {
//   constructor({ dirs }) {
//     this.watcher = new Watchpack({
//       aggregateTimeout: 1000,
//       ignored: [
//         /\.lock$/,
//         /\.log$/,
//         /(^|[\/\\])\../,
//         dirs
//           .map(item => {
//             let re = [];
//             for (let key in patterns) {
//               re.push(glob.sync(`${item}/${key}`));
//             }
//             return re;
//           })
//           .reduce((single, all) => all.concat(single), [])
//       ]
//     });
//     this.watcher.watch([], dirs, Date.now() - 10000);
//   }

//   onChange(callback) {
//     this.watcher.on("change", callback);
//   }
//   onAggregate(callback) {
//     this.watcher.on("aggregated", callback);
//   }
// }
