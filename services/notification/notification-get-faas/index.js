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

const queryIndex = require('./lib/dynamodb')

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

const NOTIFICATIONS_TABLE_INDEX_NAME = 'account-index'
const NOTIFICATIONS_TABLE_INDEX_ATTRIBUTE = 'account'
const PENDING_NOTIFICATIONS_PROPERTY = 'pending'

// env var inventory (avoid const declaration):
// process.env.AWS_REGION
// process.env.WSS_CONNECTION_URL
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.WEBSOCKETS_TABLE_NAME
// process.env.POOL_NAME

// https://sequelize.readthedocs.io/en/2.0/docs/models-definition/
const notificationWebsocketsModel = (sequelize, type) => {
  return sequelize.define(
    'notification_websockets',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      connection_id: type.STRING,
      created_at: type.DATE,
      epoch_created_at: type.BIGINT,
      account: type.STRING
    },
    {
      timestamps: false
    }
  )
}

// create db connection outside of handler for multiple invocations
const pgConnection = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    operatorAliases: false,
    logging: console.log,
    port: process.env.PGPORT,
    dialect: 'postgres',
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000
    }
  }
)

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
  // todo: test for idToken
  if (!accountFromJWT) {
    throw Error("failed to parse account from token")
  }

  // account values not available when websocket connection ids
  // initially stored in postgres. workaround: each lambda retrieves
  // current record for connection id to test for account value, then adds
  // account from token to postgres connection id record if not present.
  // adding account values to all connection id records supports notification
  // broadcast (send notifications to all connection ids owned by current account)
  // query for connection id:
  let notificationWebsocketsTable = notificationWebsocketsModel(
    pgConnection,
    Sequelize
  )

  let currentConnection = await notificationWebsocketsTable.findOne({
    where: {
      connection_id: websocketConnectionId
    }
  })

  console.log('current connection: ' + JSON.stringify(currentConnection))

  if (!currentConnection.account) {
    await notificationWebsocketsTable.update({
      account: accountFromJWT
    }, {
      where: {
        connection_id: websocketConnectionId
      }
    })
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
    statusCode: 200
  }

}