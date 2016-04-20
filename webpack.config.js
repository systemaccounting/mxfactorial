var path = require('path');
var appPath = path.join(__dirname, 'app');
var buildPath = path.join(__dirname, 'build');
var webpack = require('webpack');

module.exports = {
    context: appPath,
    entry:  path.join(appPath, 'client.js'),
    output: {
        path:       buildPath,
        filename:   'bundle.js',
        publicPath: 'build/'
    },
    devtool: 'inline-source-map',
    devServer: {
    	contentBase: buildPath,
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
        stats: 'errors-only',
        host: process.env.HOST,
        port: process.env.PORT
    },
    resolve: {
    	extensions: ['', '.js', '.jsx']
    },
    module: {
    	loaders: [
    	    {
    	    	test:    /\.jsx?$/,
    	    	loader:  'babel-loader',
    	    	include: appPath,
    	    },
    	    {
    	    	test:    /\.css/,
    	    	loaders: ['style', 'css'],
    	    	include: appPath,
    	    },
    	    {
    	    	test:    /\.html/,
    	    	loader:  'html',
    	    	exclude: '/node_modules/',
    	    }
    	],
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ],
};