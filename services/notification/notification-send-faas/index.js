const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
const microtime = require('microtime')
const Sequelize = require('sequelize') // added as dev dep since published in lambda layer

const {
  formatPendingNotifications,
  batchWriteTable,
  sendMessageToClient
} = require('./lib/awsServices')

const {
  accountsReceivingTransactionNotifications,
  transactionNotificationsToSend,
  dedupeTransactionNotificationRecipients,
  idAndTimestampNotifications
} = require('./supportedServices/transact')

const {
  connection,
  tableModel
} = require('./lib/postgres')

// env var inventory (avoid declaring as const):
// process.env.AWS_REGION
// process.env.WSS_CONNECTION_URL
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.PGDATABASE
// process.env.PGUSER
// process.env.PGPASSWORD
// process.env.PGHOST
// process.env.PGPORT

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

    let websocketsTable = tableModel(
      connection,
      Sequelize,
      'notification_websockets',
    )

    let websocketsOwnedByCurrentAccount = await websocketsTable.findAll({ where: { account } })

    if (websocketsOwnedByCurrentAccount.length > 0) {
      // broadcast pending notifications to each client
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

        // send
        console.log(`sending account ${currAcct} clear notification confirmation to ${currConnId} websocket`)
        let confirmed = {
          [PENDING_NOTIFICATIONS_PROPERTY]: notificationsPerAccount
        }
        await sendMessageToClient(ws, currConnId, confirmed)
      }
    } else {
      console.log('0 notifcation websockets for account: ', account)
    }
  }
}