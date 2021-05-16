let path = require('path')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let CopyWebpackPlugin = require('copy-webpack-plugin')
let babelConfig = require('./babel.config')

let examples = [
  'quick-start',
  'composing-modules',
  'async-tasks',
  'special-events',
  'initial-load',
]

module.exports = {
  mode: 'development',
  entry: Object.fromEntries(
    examples
      .map(k => [k, path.resolve(__dirname, 'examples', k, 'index.js')])
  ),
  output: {
    path: path.resolve(__dirname, 'dist-examples'),
    filename: './[name]/bundle.js',
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
    ],
  },
  resolve: {
    alias: {
      movium: path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'examples', 'public'),
          to: '.',
        },
      ],
    }),
    ...examples.map(k =>
      new HtmlWebpackPlugin({
        title: 'example: ' + k,
        chunks: [k],
        filename: `./${k}/index.html`,
      })
    )
  ],
  devServer: {
    hot: true,
  },
  devtool: 'inline-source-map',
}
