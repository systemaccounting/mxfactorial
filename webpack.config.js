var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry:  './app/client.js',
    output: {
        path:       './build',
        filename:   'bundle.js',
    },
    devtool: 'inline-source-map',
    devServer: {
        inline: true,
        port: 8080
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
                loaders: ['style', 'css', 'sass'],
                exclude: '/node_modules/',
            },
            {
                test:    /\.scss/,
                loaders: ['style', 'css', 'sass'],
                exclude: '/node_modules/',
            },
            {
                test:    /\.html/,
                loader:  'html',
                exclude: '/node_modules/',
            },
            {
                test:   /\.(png|gif|jpe?g|svg)$/i,
                loader: 'file-loader?name=static/images/[name].[ext]',
                exclude: '/node_modules/',
            }
        ],
    }
};