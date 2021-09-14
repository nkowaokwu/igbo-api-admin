const path = require('path');
const { SourceMapDevToolPlugin, DefinePlugin } = require('webpack');

const clientPort = 3031;

module.exports = (_, argv) => ({
  mode: argv.mode,
  entry: {
    app: path.join(__dirname, 'src', 'index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  devServer: {
    port: clientPort,
    liveReload: true,
    watchContentBase: true,
    writeToDisk: true,
    publicPath: '/',
    contentBase: './public',
  },
  module: {
    rules: [
      { use: ['source-map-loader'] },
      { test: /\.ts$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.tsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.css$/,
        loader: 'style-loader',
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[local]',
          },
        },
      },
    ],
  },
  plugins: [
    new SourceMapDevToolPlugin({
      filename: '[file].map',
      test: ['.ts', '.tsx'],
    }),
    new DefinePlugin({
      'process.env': {},
    }),
  ],
});
