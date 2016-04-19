var webpack = require('webpack')
var nodeModules = /^[a-z\/\-0-9]+$/i

module.exports = {
  context: __dirname + "/src",
  entry: "./index",
  output: {
    path: __dirname + "/lib",
    filename: "index.js",
    libraryTarget: 'commonjs2'
  },
  externals: [nodeModules],
  target: 'node',
  module: {
    loaders: [
      { test: /.jsx?$/, loader: 'babel', include: /src/ }
    ]
  }
}