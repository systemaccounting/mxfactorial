const AWS = require('aws-sdk')

const {
  formatNotificationsToClear,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
} = require('./lib/awsServices')

const AWS_REGION = process.env.AWS_REGION
const NOTIFICATIONS_TABLE_NAME = process.env.NOTIFICATIONS_TABLE_NAME
const WEBSOCKETS_TABLE_NAME = process.env.WEBSOCKETS_TABLE_NAME
const WSS_CONNECTION_URL = process.env.WSS_CONNECTION_URL
const WEBSOCKETS_TABLE_INDEX_NAME = 'account-index'
const WEBSOCKETS_TABLE_ACCOUNT_ATTRIBUTE = 'account'
const CLEARED_NOTIFICATIONS_PROPERTY = 'cleared'

// {"action":"clearnotifications","notifications":[{"account":"...","time_uuid":"..."},]}
exports.handler = async event => {
  console.log(JSON.stringify(event))

  // declared within handler for local testing
  let ddb = new AWS.DynamoDB.DocumentClient({ region: AWS_REGION })
  let ws = new AWS.ApiGatewayManagementApi({ endpoint: WSS_CONNECTION_URL })

  let body = JSON.parse(event.body)
  let notificationsToClear = body.notifications

  // prep notifications for delete in dynamodb
  let formattedItemsToDelete = formatNotificationsToClear(notificationsToClear)

  // delete notifications
  await batchWriteTable(ddb, NOTIFICATIONS_TABLE_NAME, formattedItemsToDelete)

    // retrieve all wss connection ids owned by account
  let account = event.requestContext.authorizer.account
  let connectionsOwnedByAccount = await queryIndex(
    ddb,
    WEBSOCKETS_TABLE_NAME,
    WEBSOCKETS_TABLE_INDEX_NAME,
    WEBSOCKETS_TABLE_ACCOUNT_ATTRIBUTE,
    account
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