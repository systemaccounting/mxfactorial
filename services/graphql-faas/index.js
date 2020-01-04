const awsServerlessExpress = require('aws-serverless-express')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const axios = require('axios')

const {
  getClaimedKeyId,
  matchCognitoWebKey,
  pem,
  verifyToken
} = require('./src/jwt')

const appWrapper = require('./src/app')

exports.handler = async (event, context) => {
  const token = event.headers.Authorization

  let getJwks
  try {
    getJwks = await axios.get(process.env.JWKS_URL)
  } catch(e) {
    console.log(e)
    throw e
  }

  const jwks = getJwks.data.keys

  const currentClaimedKeyId = getClaimedKeyId(token)

  const currentMatchedCognitoWebKey = matchCognitoWebKey(
    jwks,
    currentClaimedKeyId
  )

  const cognitoWebKeyAsPem = pem(jwkToPem, currentMatchedCognitoWebKey)

  let currentVerifiedToken
  try {
    currentVerifiedToken = await verifyToken( // todo: test for idToken
      jwt,
      token,
      cognitoWebKeyAsPem,
      currentMatchedCognitoWebKey
    )
  } catch(e) {
    console.log(e)
    throw e
  }

  const accountFromJWT = currentVerifiedToken['cognito:username']

  // add account to event object for downstream services
  event.graphqlRequestSender = accountFromJWT

  const server = awsServerlessExpress.createServer(appWrapper(event, context))

  // https://github.com/awslabs/aws-serverless-express/issues/134#issuecomment-495026574
  // test aws-serverless-express 4.0 when published
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise
}
