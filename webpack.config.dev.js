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

  devServer: {
    contentBase: './build',
    inline: true,
    port: 8000
  },

  devtool: 'inline-source-map',

  resolve: {
    extensions: ['', '.js', '.jsx']
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
        test:    /\.html/,
        loader:  'html'
      },
      {
        test:   /\.(png|gif|jpe?g|svg)$/i,
        loader: 'file-loader?name=static/images/[name].[ext]',
      }
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': '"development"'
      }
    }),
  ]
};