const AWS = require('aws-sdk')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const axios = require('axios')
const Sequelize = require('sequelize') // added as dev dep since published in lambda layer

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
  formatNotificationsToClear,
  batchWriteTable,
} = require('./lib/dynamodb')

const {
  sendMessageToClient
} = require('./lib/apiGateway')

const {
  connection,
  tableModel
} = require('./lib/postgres')

// avoid const assignment for env vars
// process.env.AWS_REGION
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.WSS_CONNECTION_URL
// process.env.POOL_NAME
// process.env.PGDATABASE
// process.env.PGUSER
// process.env.PGPASSWORD
// process.env.PGHOST
// process.env.PGPORT

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })
const ws = new AWS.ApiGatewayManagementApi({ endpoint: process.env.WSS_CONNECTION_URL })
let cognito = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION })

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
  // initially stored in postgres. workaround: each lambda retrieves
  // current record for connection id to test for account value, then adds
  // account from token to postgres connection id record if not present.
  // adding account values to all connection id records supports notification
  // broadcast (send notifications to all connection ids owned by current account)
  // query for connection id:
  let websocketsTable = tableModel(
    connection,
    Sequelize,
    'notification_websockets',
  )

  let currentConnection = await websocketsTable.findOne({
    where: {
      connection_id: websocketConnectionId
    }
  })

  console.log('current connection: ' + JSON.stringify(currentConnection))

  if (!currentConnection) {
    throw Error('0 stored connections')
  }

  if (!currentConnection.account) {
    await websocketsTable.update({
      account: accountFromJWT
    }, {
      where: {
        connection_id: websocketConnectionId
      }
    })
  }

  let notificationsToClear = websocketMessage.notifications

  // prep notifications for delete in dynamodb
  let formattedItemsToDelete = formatNotificationsToClear(notificationsToClear)

  // delete notifications
  await batchWriteTable(ddb, process.env.NOTIFICATIONS_TABLE_NAME, formattedItemsToDelete)

  // retrieve all wss connection ids owned by account
  let websocketsOwnedByCurrentAccount = await websocketsTable.findAll({
    where: { account: accountFromJWT }
  })
  console.log(websocketsOwnedByCurrentAccount)
  // broadcast which messages cleared to each client
  for (let i = 0; i < websocketsOwnedByCurrentAccount.length; i++) {

    let currConnId = websocketsOwnedByCurrentAccount[i].connection_id
    let currAcct = websocketsOwnedByCurrentAccount[i].account

    // delete and skip expired websocket connections before sending
    try {
      await sendMessageToClient(ws, currConnId, 'ping')
    } catch(err) {
      if (err.message == '410') {
        let deleteResult = await websocketsTable.destroy({
          where: {
            connection_id: currConnId
          }
        })
        console.log(deleteResult)
        continue
      }
    }

    console.log(`sending account ${currAcct} clear notification confirmation to ${currConnId} websocket`)

    let confirmed = {
      [CLEARED_NOTIFICATIONS_PROPERTY]: notificationsToClear
    }
    await sendMessageToClient(ws, currConnId, confirmed)
  }
  // notify success to gateway
  return {
    statusCode: 200
  }
  
}