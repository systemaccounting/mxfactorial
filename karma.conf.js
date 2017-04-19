module.exports = function (config) {
  config.set({
    basePath: '.',
    browsers: ['PhantomJS'],
    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      'test/**/*.spec.js'
    ],
    port: 8080,
    browserNoActivityTimeout : 100000, //default 10000
    browserDisconnectTimeout : 100000, // default 2000
    browserDisconnectTolerance : 1, // default 0
    captureTimeout: 100000,
    frameworks: ['mocha', 'should'],
    client: {
      mocha: {
      }
    },
    singleRun: true,
    reporters: ['mocha', 'coverage'],
    preprocessors: {
      'test/**/*.spec.js': ['webpack'],
      'app/**/*.js': ['webpack', 'coverage']
    },
    webpack: {
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['node_modules', 'app', 'static', 'test']
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            use: 'babel-loader',
            exclude: /node_modules/
          },
          {
            test: /\.scss/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
            exclude: '/node_modules/'
          },
          {
            test: /\.(png|gif|jpe?g|svg)$/i,
            use: 'file-loader?name=static/images/[name].[ext]',
            exclude: '/node_modules/'
          }
        ]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    webpackServer: {
      noInfo: true
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'text', subdir: 'report-text' },
        { type: 'lcov', subdir: 'report-lcov' }
      ]
    }
  });
};
