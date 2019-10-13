const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient({ region: AWS_REGION })
const ws = new AWS.ApiGatewayManagementApi({ endpoint: WSS_CONNECTION_URL })

const {
  queryIndex,
  queryTable,
  sendMessageToClient
} = require('./lib/awsServices')

const AWS_REGION = process.env.AWS_REGION
const NOTIFICATIONS_TABLE_NAME = process.env.NOTIFICATIONS_TABLE_NAME
const WEBSOCKETS_TABLE_NAME = process.env.WEBSOCKETS_TABLE_NAME
const WSS_CONNECTION_URL = process.env.WSS_CONNECTION_URL
const WEBSOCKETS_TABLE_PRIMARY_KEY = 'connection_id'
const NOTIFICATIONS_TABLE_INDEX_NAME = 'account-index'
const NOTIFICATIONS_TABLE_INDEX_ATTRIBUTE = 'account'
const PENDING_NOTIFICATIONS_PROPERTY = 'pending'


// {"action":"getnotifications"}
exports.handler = async event => {
  console.log(JSON.stringify(event))

  // retrieve account owned by connection id
  let websocketItems = await queryTable(
    ddb,
    WEBSOCKETS_TABLE_NAME,
    WEBSOCKETS_TABLE_PRIMARY_KEY,
    event.requestContext.connectionId
  )

  let account = websocketItems[0].account

  // retrieve pending notifications
  let pendingNotifications = await queryIndex(
    ddb,
    NOTIFICATIONS_TABLE_NAME,
    NOTIFICATIONS_TABLE_INDEX_NAME,
    100,
    NOTIFICATIONS_TABLE_INDEX_ATTRIBUTE,
    account
  )
  // pair with 'pending' property for convenient client parsing
  let pending = {
    [PENDING_NOTIFICATIONS_PROPERTY]: pendingNotifications
  }
  // send pending notifications to websocket client
  await sendMessageToClient(
    ws,
    event.requestContext.connectionId,
    pending
  )
  // notify success to gateway
  return {
    statusCode: 200,
    body: JSON.stringify(pendingNotifications)
  }

}