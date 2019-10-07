const AWS = require('aws-sdk')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const axios = require('axios')

const {
  getPools,
  filterCurrentCognitoPoolId,
  getCognitoJsonWebKeys,
  matchCognitoWebKey
} = require('./lib/cognito')

const {
  getClaimedKeyId,
  pem,
  verifyToken
} = require('./lib/jwt')

const authorize = require('./lib/iam')

const AWS_REGION = process.env.AWS_REGION
const POOL_ID_NAME = process.env.POOL_ID_NAME


exports.handler = async event => {
  console.log(event)
  let { headers, methodArn } = event

  if (!headers.Authorization) {
    console.log('Authorization value missing. exiting')
    throw new Error('unauthorized')
  }

  let regex = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/
  if (!regex.test(headers.Authorization)) {
    console.log('malformed token received. exiting')
    throw new Error('malformed token')
  }

  let token = headers.Authorization

  let config = {
    apiVersion: '2016-04-18',
    region: AWS_REGION
  }
  let cognito = new AWS.CognitoIdentityServiceProvider(config)

  let pools = await getPools(cognito)
  let filteredCognitoPoolId = await filterCurrentCognitoPoolId(pools, POOL_ID_NAME)
  let cognitoJsonWebKeys = await getCognitoJsonWebKeys(
    axios,
    AWS_REGION,
    filteredCognitoPoolId
  )
  let currentClaimedKeyId = getClaimedKeyId(token)
  let currentMatchedCognitoWebKey = matchCognitoWebKey(
    cognitoJsonWebKeys,
    currentClaimedKeyId
  )
  let cognitoWebKeyAsPem = pem(jwkToPem, currentMatchedCognitoWebKey)
  let currentVerifiedToken = await verifyToken(
    jwt,
    token,
    cognitoWebKeyAsPem,
    currentMatchedCognitoWebKey
  ).catch(err => {
    throw err
  }) // unhandled promise rejection warnings

  let account = currentVerifiedToken['cognito:username']

  return authorize(methodArn, account)
}
