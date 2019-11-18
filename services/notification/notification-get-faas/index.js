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

const {
  updateItem,
  queryIndex,
  queryTable
} = require('./lib/dynamodb')

const {
  sendMessageToClient
} = require('./lib/apiGateway')

const ddb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION
})

const ws = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WSS_CONNECTION_URL
})

let cognito = new AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
  region: process.env.AWS_REGION
})

const WEBSOCKETS_TABLE_PARTITION_KEY = 'connection_id'
const NOTIFICATIONS_TABLE_INDEX_NAME = 'account-index'
const NOTIFICATIONS_TABLE_INDEX_ATTRIBUTE = 'account'
const WEBSOCKET_TABLE_INDEX_ATTRIBUTE = 'account'
const PENDING_NOTIFICATIONS_PROPERTY = 'pending'
const DYNAMODB_UPDATE_CONDITION_EXPRESSION = 'attribute_not_exists'

// env var inventory (avoid const declaration):
// process.env.AWS_REGION
// process.env.WSS_CONNECTION_URL
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.WEBSOCKETS_TABLE_NAME
// process.env.POOL_NAME

// {"action":"getnotifications"}
exports.handler = async event => {
  console.log(JSON.stringify(event))
  let websocketMessage = JSON.parse(event.body)
  let websocketConnectionId = event.requestContext.connectionId

  if (!websocketMessage.token) {
    console.log('Authorization value missing. exiting')
    throw new Error('unauthorized')
  }

  let regex = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/
  if (!regex.test(websocketMessage.token)) {
    console.log('malformed token received. exiting')
    throw new Error('malformed token')
  }

  let token = websocketMessage.token

  let pools = await getPools(cognito)

  let filteredCognitoPoolId = await filterCurrentCognitoPoolId(
    pools,
    process.env.POOL_NAME
  )

  let cognitoJsonWebKeys = await getCognitoJsonWebKeys(
    axios,
    process.env.AWS_REGION,
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

  let accountFromJWT = currentVerifiedToken['cognito:username']

  // account values not available when websocket connection ids
  // initially stored in dynamodb. workaround: each lambda retrieves
  // current record for connection id to test for account value, then adds
  // account from token to dynamodb connection id record if not present.
  // adding account values to all connection id records supports notification
  // broadcase (send notifications to all connection ids owned by current account)
  // query for connection id:
  let websocketItems = await queryTable(
    ddb,
    process.env.WEBSOCKETS_TABLE_NAME,
    WEBSOCKETS_TABLE_PARTITION_KEY,
    websocketConnectionId
  )

  // console.log(websocketItems)
  // add account value to connection id record if not included
  if (websocketItems.length > 0) {
    console.log(websocketItems)
    if (!websocketItems[0].account) {
      await updateItem(
        ddb,
        process.env.WEBSOCKETS_TABLE_NAME,
        WEBSOCKETS_TABLE_PARTITION_KEY,
        websocketConnectionId,
        WEBSOCKET_TABLE_INDEX_ATTRIBUTE, // newAttributeKey
        accountFromJWT, // newAttributeValue
        DYNAMODB_UPDATE_CONDITION_EXPRESSION // updateConditionExpression
      )
    }
  }

  // retrieve pending notifications
  let pendingNotifications = await queryIndex(
    ddb,
    process.env.NOTIFICATIONS_TABLE_NAME,
    NOTIFICATIONS_TABLE_INDEX_NAME,
    100,
    NOTIFICATIONS_TABLE_INDEX_ATTRIBUTE,
    accountFromJWT
  )
  // pair with 'pending' property for convenient client parsing
  let pending = {
    [PENDING_NOTIFICATIONS_PROPERTY]: pendingNotifications
  }
  // send pending notifications to websocket client
  await sendMessageToClient(
    ws,
    websocketConnectionId,
    pending
  )
  // notify success to gateway
  return {
    statusCode: 200,
    body: JSON.stringify(pendingNotifications)
  }

}