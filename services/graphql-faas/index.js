const awsServerlessExpress = require('aws-serverless-express')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const axios = require('axios')

const appWrapper = require('./src/app')

// parse key id from token
const getClaimedKeyId = token => {
  let header = token.split('.')[0]
  let decodedHeader = Buffer.from(header, 'base64').toString('ascii')
  let keyIdObj = JSON.parse(decodedHeader)
  let claimedKeyId = keyIdObj.kid
  return claimedKeyId
}

// match token's key id to cognito's web key
const matchCognitoWebKey = (keys, claimedKeyId) => {
  let matchedCognitoKey = []
  for (key of keys) {
    if (claimedKeyId == key.kid) {
      matchedCognitoKey.push(key)
    }
  }

  if (matchedCognitoKey.length < 1) {
    console.log('0 claimed cognito keys matched. exiting')
    throw new Error('0 claimed cognito keys matched')
  }

  if (matchedCognitoKey.length > 1) {
    console.log('duplicate claimed cognito keys matched.')
    // todo: alert event
  }

  let matchedCognitoWebKey = matchedCognitoKey[0]
  return matchedCognitoWebKey
}

// convert web key to cert for verify
const pem = (pemPackage, jsonWebKey) => pemPackage(jsonWebKey)

exports.handler = (event, context) => {
  const token = event.headers.Authorization

  const receiveVerifiedToken = (err, decoded) => {
    if (err) {
      console.log(err)
      return err
    }
      // add account to event object
    event.graphqlRequestSender = decoded['cognito:username']

    const server = awsServerlessExpress.createServer(appWrapper(event, context))
    return awsServerlessExpress.proxy(server, event, context)
  }

  axios.get(process.env.JWKS_URL)
    .then(jwksResponse => {
      const jwks = jwksResponse.data.keys
      const currentClaimedKeyId = getClaimedKeyId(token)
      const currentMatchedCognitoWebKey = matchCognitoWebKey(
        jwks,
        currentClaimedKeyId
      )
      const cognitoWebKeyAsPem = pem(jwkToPem, currentMatchedCognitoWebKey)
      const jwtOptions = {
        algorithms: [currentMatchedCognitoWebKey.alg],
        issuer: currentMatchedCognitoWebKey.iss
      }
      jwt.verify(token, cognitoWebKeyAsPem, jwtOptions, receiveVerifiedToken)
    })
    .catch(jwksError => {
      console.log(jwksError)
      return jwksError
    })
}
