const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
const axios = require('axios')

const compareTransactions = require('./src/compareTransactions')
const storeTransactions = require('./src/storeTransactions')
const requestRules = require('./src/requestRules')
const sendNotification = require('./src/sendNotification')

const STATUS_SUCCESS = 'success'
const STATUS_FAILED = 'failed'

const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
  region: process.env.AWS_REGION
})

exports.handler = async event => {
  if (!event.items) {
    console.log(`Empty object received by resolver`)
    return {
      status: STATUS_FAILED,
      message: 'Please specify at least 1 transaction'
    }
  }

  let transactions = event.items

  let responseFromRules = await requestRules(
    axios,
    process.env.RULES_URL,
    transactions
  )

  if (!responseFromRules) {
    return {
      status: STATUS_FAILED,
      message: 'Failed to fetch transactions from /rules service'
    }
  }

  // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
  let isEqual = compareTransactions(transactions, responseFromRules)

  if (!isEqual) {
    return {
      status: STATUS_FAILED,
      message: 'Required items missing'
    }
  }

  let transactionId = uuid() // same for all transaction items, identifies set

  // Always ignore approval time fields sent from client
  let preparedItems = transactions.map(item => {
    let {
      debitor_approval_time,
      creditor_approval_time,
      ...allowedItems
    } = item
    allowedItems.transaction_id = transactionId
    return allowedItems
  })

  let storedTransactions = await storeTransactions(preparedItems)

  let notification = {
    service: 'TRANSACT',
    message: storedTransactions
  }

  await sendNotification(sns, process.env.NOTIFY_TOPIC_ARN, notification)

  return {
    status: STATUS_SUCCESS,
    data: storedTransactions
  }
}
