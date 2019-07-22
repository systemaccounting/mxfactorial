const Amplify = require('@aws-amplify/core')
const Auth = require('@aws-amplify/auth')

Amplify.default.configure({
  Auth: {
    userPoolId: process.env.REACT_APP_COGNITO_POOL_ID || 'us-east-1_unit-test',
    userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || 'unit-test'
  }
})

async function authenticate(username = 'JoeSmith', password = 'password') {
  await Auth.default.signIn(username, password)
  return await Auth.default.currentSession()
}

module.exports = authenticate
