const path = require("path");
const fs = require("fs");

const directoryPath = path.join(__dirname, "functions");

const entrypoints = fs
  .readdirSync(directoryPath, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .reduce(function (obj, value) {
    obj[value] = `./functions/${value}/index.ts`;

    return obj;
  }, {});

module.exports = {
  target: "node",
  entry: {
    lambda1: "./functions/lambda1/index.ts",
    lambda2: "./functions/lambda2/index.ts",
  },
  output: {
    filename: "[name]/index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  mode: "production",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
