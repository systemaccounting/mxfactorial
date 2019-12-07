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

// env var inventory (avoid declaring as const):
// process.env.AWS_REGION
// process.env.WSS_CONNECTION_URL
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.WEBSOCKETS_TABLE_NAME

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

    let notificationWebsocketsTable = notificationWebsocketsModel(
      pgConnection,
      Sequelize
    )

    let websocketsOwnedByCurrentAccount = await notificationWebsocketsTable
      .findAll({ where: { account } })

    if (websocketsOwnedByCurrentAccount.length > 0) {

      // broadcast pending notifications to each client
      let connId = websocketsOwnedByCurrentAccount[i].connection_id
      let acct = websocketsOwnedByCurrentAccount[i].account
      console.log(`sending account ${acct} clear notification confirmation to ${connId} websocket`)

      for (let i = 0; i < websocketsOwnedByCurrentAccount.length; i++) {
        let confirmed = {
          [PENDING_NOTIFICATIONS_PROPERTY]: notificationsPerAccount
        }
        await sendMessageToClient(ws, connId, confirmed)
      }
    } else {
      console.log('0 notifcation websockets for account: ', account)
    }
  }
}