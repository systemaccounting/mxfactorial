module.exports = {
  extends: [
    'prettier/react',
    'plugin:prettier/recommended'
  ],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
        jsx: true,
        experimentalObjectRestSpread: true
    }
  },
  plugins: ['jest'],
  env: {
    'jest/globals': true
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: false,
        singleQuote: true,
        trailingComma: 'none',
        bracketSpacing: true
      }
    ],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 0
  }
}