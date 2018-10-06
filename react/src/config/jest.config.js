module.exports = {
  verbose: true,
  rootDir: '../../',
  verbose: true,
  transform: {
    '^.+\\.(js|jsx|mjs)$': require.resolve(
      'react-scripts/config/jest/babelTransform.js'
    ),
    '^.+\\.css$': require.resolve('react-scripts/config/jest/cssTransform.js'),
    '^(?!.*\\.(js|jsx|mjs|css|json|graphql)$)': require.resolve(
      'react-scripts/config/jest/fileTransform.js'
    )
  },
  moduleNameMapper: {
    '^.+\\.(jpg|jpeg|png|gif|svg|json)$': require.resolve(
      'react-scripts/config/jest/fileTransform.js'
    ),
    '^.+\\.css$': require.resolve('react-scripts/config/jest/cssTransform.js')
  },
  testRegex: '(/__tests__/.*|(\\.|/)test)\\.jsx?$',
  moduleDirectories: ['node_modules', 'src'], // need for absolute imports to work
  moduleFileExtensions: ['js', 'jsx', 'json'],
  setupTestFrameworkScriptFile: '<rootDir>/src/setupTests.js',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/App.js',
    '!src/setupTests.js',
    '!src/registerServiceWorker.js',
    '!src/assets/index.js',
    '!src/config/jest.config.js',
    '!src/config/amplify.js',
    '!src/containers/**/*.js',
    '!src/lib/**/*.js'
  ]
}
