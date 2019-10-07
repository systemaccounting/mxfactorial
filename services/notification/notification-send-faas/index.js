const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
const microtime = require('microtime')

const {
  idAndTimestampNotifications,
  formatPendingNotifications,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
} = require('./lib/awsServices')

const {
  dedupeAccounts
} = require('./lib/utils')

const AWS_REGION = process.env.AWS_REGION
const WSS_CONNECTION_URL = process.env.WSS_CONNECTION_URL
const NOTIFICATIONS_TABLE_NAME = process.env.NOTIFICATIONS_TABLE_NAME
const WEBSOCKETS_TABLE_NAME = process.env.WEBSOCKETS_TABLE_NAME
const WEBSOCKETS_TABLE_INDEX_NAME = 'account-index'
const WEBSOCKETS_TABLE_ACCOUNT_ATTRIBUTE = 'account'
const PENDING_NOTIFICATIONS_PROPERTY = 'pending'

exports.handler = async event => {
  // todo: test notifications for account and message values, types
  let message = event.Records[0].Sns.Message
  let notifications = JSON.parse(message)
  // console.log(notifications)
  let dedupedAccounts = dedupeAccounts(notifications)

  // pass callbacks to aws to inventory and log unstored and unsent notifications:
  // let unstoredNotifications = [ ...notifications ]
  // let unsentNotifications = [ ...notifications ]

  for (account of dedupedAccounts) {
    let matchedNotifications = notifications.filter(notif => {
      return account === notif.account
    })

    let receivedItems = idAndTimestampNotifications(
      uuid,
      microtime,
      matchedNotifications
    )

    let ddbPutFormattedItems = formatPendingNotifications(receivedItems)

    // declared within handler for local testing
    let ddb = new AWS.DynamoDB.DocumentClient({ region: AWS_REGION })
    let ws = new AWS.ApiGatewayManagementApi({ endpoint: WSS_CONNECTION_URL })

    let unprocessedItems = await batchWriteTable(
      ddb,
      NOTIFICATIONS_TABLE_NAME,
      ddbPutFormattedItems
    )

    if (unprocessedItems != null) {
      // todo: repeat storage of unprocessed items:
      // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html#API_BatchWriteItem_ResponseElements
      // todo: add unprocessed items alert
    }

    // retrieve wss connection ids owned by account
    let connectionsOwnedByAccount = await queryIndex(
      ddb,
      WEBSOCKETS_TABLE_NAME,
      WEBSOCKETS_TABLE_INDEX_NAME,
      WEBSOCKETS_TABLE_ACCOUNT_ATTRIBUTE,
      account
    )
    if (connectionsOwnedByAccount.length > 0) {
      // broadcast pending notifications to each client
      for (let i = 0; i < connectionsOwnedByAccount.length; i++) {
        let confirmed = {
          [PENDING_NOTIFICATIONS_PROPERTY]: receivedItems
        }
        await sendMessageToClient(
          ws,
          connectionsOwnedByAccount[i].connection_id,
          confirmed
        )
      }
    } else {
      console.log('0 notifcation websockets for account: ', account)
    }
  }
}