const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const DotenvPlugin = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "9000";

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    compress: true,
    historyApiFallback: true,
    host: HOST,
    hot: true,
    open: true,
    port: PORT,
  },
  plugins: [
    new DotenvPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/base.css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/quickstarts/dist/quickstarts.css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-topology/node_modules/@patternfly/react-styles/css')
        ],
        use: ['style-loader', 'css-loader']
      }
    ]
  }
});

if (process.env.ESLINT_ENABLE === 'true') {
  console.log('ESLint webpack-plugin enabled...');
  module.exports.plugins.push(new ESLintPlugin({
    cache: true,
    cacheLocation: path.resolve(__dirname, '.eslintcache'),
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    exclude: ['node_modules', 'dist'],
  }));
}
