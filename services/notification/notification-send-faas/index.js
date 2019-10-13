const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
const microtime = require('microtime')

const {
  formatPendingNotifications,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
} = require('./lib/awsServices')

const {
  accountsReceivingTransactionNotifications,
  transactionNotificationsToSend,
  dedupeTransactionNotificationRecipients,
  idAndTimestampNotifications
} = require('./supportedServices/transact')

// env var inventory (avoid declaring as const):
// process.env.AWS_REGION
// process.env.WSS_CONNECTION_URL
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.WEBSOCKETS_TABLE_NAME

const WEBSOCKETS_TABLE_INDEX_NAME = 'account-index'
const WEBSOCKETS_TABLE_ACCOUNT_ATTRIBUTE = 'account'
const PENDING_NOTIFICATIONS_PROPERTY = 'pending'
const CREDITOR_PROPERTY = 'creditor'
const DEBITOR_PROPERTY = 'debitor'
const TRANSACT_SERVICE_NAME = 'TRANSACT'

const ddb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION
})
const ws = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WSS_CONNECTION_URL
})


exports.handler = async event => {
  // todo: test notifications for account and message values, types
  let message = event.Records[0].Sns.Message
  let notifications = JSON.parse(message)
  console.log(notifications)

  let accountsReceivingNotification
  let notificationsToSend

  if (notifications.service === TRANSACT_SERVICE_NAME) {

    let transactionList = notifications.message

    accountsReceivingNotification = accountsReceivingTransactionNotifications(
        transactionList,
        dedupeTransactionNotificationRecipients,
        CREDITOR_PROPERTY,
        DEBITOR_PROPERTY
    )

    notificationsToSend = transactionNotificationsToSend(
      uuid,
      microtime,
      accountsReceivingNotification,
      transactionList,
      idAndTimestampNotifications
    )
  } else {
    throw new Error('unsupported service')
  }

  for (account of accountsReceivingNotification) {

    // store items in ddb
    let ddbPutFormattedItems = formatPendingNotifications(notificationsToSend)
    let unprocessedItems = await batchWriteTable(
      ddb,
      process.env.NOTIFICATIONS_TABLE_NAME,
      ddbPutFormattedItems
    )

    if (unprocessedItems != null) {
      // todo: repeat storage of unprocessed items:
      // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html#API_BatchWriteItem_ResponseElements
      // todo: add unprocessed items alert
    }

    // filter received notifications per account before sending
    let notificationsPerAccount = []
    for (notification of notificationsToSend) {
      if (account === notification.account) {
        notificationsPerAccount.push(notification)
      }
    }

    // retrieve wss connection ids owned by account
    let connectionsOwnedByAccount = await queryIndex(
      ddb,
      process.env.WEBSOCKETS_TABLE_NAME,
      WEBSOCKETS_TABLE_INDEX_NAME,
      WEBSOCKETS_TABLE_ACCOUNT_ATTRIBUTE,
      account
    )

    if (connectionsOwnedByAccount.length > 0) {
      // broadcast pending notifications to each client
      for (let i = 0; i < connectionsOwnedByAccount.length; i++) {
        let confirmed = {
          [PENDING_NOTIFICATIONS_PROPERTY]: notificationsPerAccount
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