const AWS = require('aws-sdk')
const Sequelize = require('sequelize')

const compareRequests = require('./src/compareRequests')
const getRequest = require('./src/getRequest')
const updateRequest = require('./src/updateRequest')
const sendNotification = require('./src/sendNotification')

// env var inventory (avoid assigning to const):
// process.env.RULE_INSTANCES_TABLE_NAME

const STATUS_SUCCESS = 'success'
const STATUS_FAILED = 'failed'

const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
  region: process.env.AWS_REGION
})

// options.dialectModule default = pg per:
// https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    operatorsAliases: 0,
    logging: console.log,
    port: process.env.PGPORT,
    dialect: 'postgres',
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000,
      handleDisconnects: 1
    }
  }
)

exports.handler = async event => {
  if (!event.items) {
    console.log('0 items received')
    return {
      status: STATUS_FAILED,
      message: 'please specify at least 1 request'
    }
  }

  if (!event.graphqlRequestSender) {
    console.log('event.graphqlRequestSender missing')
    return {
      status: STATUS_FAILED,
      message: 'missing graphqlRequestSender'
    }
  }

  let requestItems = event.items
  let graphqlRequestSender = event.graphqlRequestSender

  let initialItemTransactionID = requestItems[0].transaction_id
  // test only graphqlRequestSender approval
  // timestamp missing from initiallyStoredRequest
  let currentAccountRole =
    (graphqlRequestSender === requestItems[0].creditor)
    ? 'creditor'
    : 'debitor'

    // test request items
  for (let i = 0; i < requestItems.length; i++) {
    // uniform transaction_id
    if (requestItems[i].transaction_id !== initialItemTransactionID) {
      const mixedMsg = 'mixed transaction ids detected'
      console.log(mixedMsg, JSON.stringify(requestItems[i]))
      return {
        status: STATUS_FAILED,
        message: mixedMsg
      }
    }
    // involve graphqlRequestSender
    if (!requestItems[i].rule_instance_id) { // rule items tested later
      if (
        requestItems[i].creditor !== graphqlRequestSender
        && requestItems[i].debitor !== graphqlRequestSender
        && requestItems[i].author !== graphqlRequestSender
        ) {
          const unAuthdMsg = 'unauthenticated account detected in items'
          console.log(unAuthdMsg, JSON.stringify(requestItems[i]))
          return {
            status: STATUS_FAILED,
            message: unAuthdMsg
          }
      }
      if (currentAccountRole === 'creditor') {
        if (requestItems[i].creditor_approval_time) {
          const prevCreditMsg = 'previously approved credit request item detected'
          console.log(prevCreditMsg, JSON.stringify(requestItems[i]))
          return {
            status: STATUS_FAILED,
            message: prevCreditMsg
          }
        }
      }
      if (currentAccountRole === 'debitor') {
        // otherwise, test debitor approval
        if (requestItems[i].debitor_approval_time) {
          const prevDebitMsg = 'previously approved debit request item detected'
          console.log(prevDebitMsg, JSON.stringify(requestItems[i]))
          return {
            status: STATUS_FAILED,
            message: prevDebitMsg
          }
        }
      }
    }
  }

  let initiallyStoredRequest = await getRequest(
    sequelize,
    requestItems[0].transaction_id // safe after testing
  )

  // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
  let isRequestEqual = compareRequests(initiallyStoredRequest, requestItems)

  if (!isRequestEqual) {
    return {
      status: STATUS_FAILED,
      message: '0 matching requests found'
    }
  }

  let approvalTimestampProperty =
    (currentAccountRole === 'creditor')
    ? 'creditor_approval_time'
    : 'debitor_approval_time'

  let updated = await updateRequest(
    sequelize,
    requestItems[0].transaction_id,
    approvalTimestampProperty
  )

  let approvedRequest = updated[1]

  // sequelize.close().then(() => console.log('postgres connection closed')) // leave open for warm lambdas

  let notification = {
    service: 'TRANSACT',
    message: approvedRequest
  }

  await sendNotification(sns, process.env.NOTIFY_TOPIC_ARN, notification)

  return {
    status: STATUS_SUCCESS,
    data: approvedRequest
  }

}
