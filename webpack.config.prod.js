var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry:  [
    'whatwg-fetch',
    path.resolve(__dirname, 'app/client.js')
  ],

  output: {
    path: path.join(__dirname, 'build'),
    filename:   'bundle.js',
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules', 'app', 'static']
  },

  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },

  module: {
    loaders: [
      {
        test:    /\.jsx?$/,
        loader:  'babel-loader',
        exclude: /node_modules/,
      },
      {
        test:    /\.scss/,
        loaders: ['style', 'css', 'sass'],
      },
      {
        test:   /\.(png|gif|jpe?g|svg)$/i,
        loader: 'file-loader?name=static/images/[name].[ext]',
      }
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
      },
    }),
    new webpack.IgnorePlugin(new RegExp("^(fs|ipc)$"))
  ]
};