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
  queryTable,
  formatNotificationsToClear,
  batchWriteTable,
  queryIndex
} = require('./lib/dynamodb')

const {
  sendMessageToClient
} = require('./lib/apiGateway')

// avoid const assignment for env vars
// process.env.AWS_REGION
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.WEBSOCKETS_TABLE_NAME
// process.env.WSS_CONNECTION_URL
// process.env.POOL_NAME

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })
const ws = new AWS.ApiGatewayManagementApi({ endpoint: process.env.WSS_CONNECTION_URL })
let cognito = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION })

const WEBSOCKETS_TABLE_PARTITION_KEY = 'connection_id'
const WEBSOCKETS_TABLE_INDEX_NAME = 'account-index'
const WEBSOCKET_TABLE_INDEX_ATTRIBUTE = 'account'
const CLEARED_NOTIFICATIONS_PROPERTY = 'cleared'

// {"action":"clearnotifications","notifications":[{"uuid":"...","timestamp":"..."}],"token":"eyJraWQiO..."}
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

  if (websocketItems.length > 0) {
    if (!websocketItems[0].account) {
      console.log(`adding ${accountFromJWT} to ${websocketConnectionId} connection id dynamodb record`)
      await updateItem(
        ddb,
        process.env.WEBSOCKETS_TABLE_NAME,
        WEBSOCKETS_TABLE_PARTITION_KEY,
        websocketConnectionId,
        WEBSOCKET_TABLE_INDEX_ATTRIBUTE, // newAttributeKey
        accountFromJWT, // newAttributeValue
      )
    }
  }

  let notificationsToClear = websocketMessage.notifications

  // prep notifications for delete in dynamodb
  let formattedItemsToDelete = formatNotificationsToClear(notificationsToClear)

  // delete notifications
  await batchWriteTable(ddb, process.env.NOTIFICATIONS_TABLE_NAME, formattedItemsToDelete)

    // retrieve all wss connection ids owned by account
  let connectionsOwnedByAccount = await queryIndex(
    ddb,
    process.env.WEBSOCKETS_TABLE_NAME,
    WEBSOCKETS_TABLE_INDEX_NAME,
    WEBSOCKET_TABLE_INDEX_ATTRIBUTE,
    accountFromJWT
  )

  // broadcast which messages cleared to each client
  for (let i = 0; i < connectionsOwnedByAccount.length; i++) {
    let confirmed = {
      [CLEARED_NOTIFICATIONS_PROPERTY]: notificationsToClear
    }
    await sendMessageToClient(
      ws,
      connectionsOwnedByAccount[i].connection_id,
      confirmed
    )
  }
  // notify success to gateway
  return {
    statusCode: 200,
    body: 'notifications cleared:' + JSON.stringify(notificationsToClear)
  }
}