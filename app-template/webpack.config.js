let path = require('path')

let HtmlWebpackPlugin = require('html-webpack-plugin')
let MiniCssExtractPlugin = require('mini-css-extract-plugin')
let webpack = require('webpack')
let CopyWebpackPlugin = require('copy-webpack-plugin')

let babelConfig = require('./babel.config')

module.exports = (_, { mode }) => ({
  mode: mode || 'development',
  entry: './src/index.js',
  output: {
    filename: 'main-[hash].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: {
          loader: 'babel-loader',
          options: babelConfig,
        },
        exclude: /node_modules/,
      },
      {
        test: /.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(woff|ttf|svg)$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      title: 'My Movium App',
    }),
    new MiniCssExtractPlugin({
      filename: '[name]-[hash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'public') },
      ],
    }),
  ].concat(mode === 'production' ? [
    // Production-only plugins
  ] : [
    // Development-only plugins
  ]),
  devServer: {
    hot: true,
  },
  devtool: mode === 'production'
    ? 'source-map'
    : 'inline-source-map',
})
