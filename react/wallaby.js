module.exports = function(wallaby) {
  // Babel, jest-cli and some other modules are located under
  // react-scripts/node_modules, so need to let node.js know about it
  var path = require('path')
  process.env.NODE_PATH +=
    path.delimiter +
    path.join(__dirname, 'node_modules') +
    path.delimiter +
    path.join(__dirname, 'node_modules/react-scripts/node_modules') +
    path.delimiter +
    path.join(wallaby.projectCacheDir, 'src')

  require('module').Module._initPaths()

  // Babel needs this
  process.env.NODE_ENV = 'development'

  var jestConfig = require('./src/config/jest.config')

  return {
    files: ['src/**/*.js', '!src/**/*.test.js'],

    tests: ['src/**/*.test.js'],

    env: {
      type: 'node',
      runner: 'node'
    },

    compilers: {
      '**/*.js': wallaby.compilers.babel({
        babel: require('babel-core'),
        presets: ['react-app']
      })
    },

    setup: wallaby => {
      var jestConfig = require('./src/config/jest.config')
      wallaby.testFramework.configure(jestConfig)
    },

    testFramework: 'jest'
  }
}
