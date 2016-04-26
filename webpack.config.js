var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry:  './app/client.js',
    output: {
        path:       './build',
        filename:   'bundle.js'
    },
    devtool: 'inline-source-map',
    devServer: {
        inline: true,
        port: 3330
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test:    /\.jsx?$/,
                loader:  'babel-loader',
                exclude: '/node_modules/',
            },
            {
                test:    /\.css/,
                loaders: ['style', 'css'],
                exclude: '/node_modules/',
            },
            {
                test:    /\.html/,
                loader:  'html',
                exclude: '/node_modules/',
            }
        ],
    }
};