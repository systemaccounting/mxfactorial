var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './app/client.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  devtool: 'inline-source-map',
  devServer: {
    inline: true,
    port: 8080
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx'],
    modules: ['node_modules', 'app', 'static']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: '/node_modules/'
      },
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: '/node_modules/'
      }, {
        test: /\.scss/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: '/node_modules/'
      }, {
        test: /\.html/,
        use: 'html-loader',
        exclude: '/node_modules/'
      }, {
        test: /\.(png|gif|jpe?g|svg)$/i,
        use: 'file-loader?name=static/images/[name].[ext]',
        exclude: '/node_modules/'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};
