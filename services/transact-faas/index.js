const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
// todo: integration tests
const {
  applyRules,
  getRules,
  queryTable
} = require('./src/applyRules')
const compareTransactions = require('./src/compareTransactions')
const storeTransactions = require('./src/storeTransactions')
const sendNotification = require('./src/sendNotification')

// env var inventory (avoid assigning to const):
// process.env.RULE_INSTANCES_TABLE_NAME

const STATUS_SUCCESS = 'success'
const STATUS_FAILED = 'failed'

// keySchema examples for rules:
// 1. creditor:Person2|name:petrol (any sale of petrol with Person2 as creditor)
// 2. name: (any transaction)
const anyItemKeySchema = 'name:' // applies to all transactions
const rulesToQuery = [ anyItemKeySchema ] // array initd for extensibility
// todo: convert multi-service constants to env vars set in terraform
const RULE_INSTANCES_TABLE_RANGE_KEY = 'key_schema'
const RULE_INSTANCE_ID_FUNCTION_PARAMETER_NAME = 'ruleId'
const RULE_INSTANCE_TRANSACTIONS_ITEMS_FUNCTION_PARAMETER_NAME = 'transactionItems'

const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
  region: process.env.AWS_REGION
})

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

exports.handler = async event => {
  if (!event.items) {
    console.log(`Empty object received by resolver`)
    return {
      status: STATUS_FAILED,
      message: 'Please specify at least 1 transaction'
    }
  }

  let transactions = event.items

  let rules = await getRules(
    rulesToQuery,
    queryTable,
    ddb,
    process.env.RULE_INSTANCES_TABLE_NAME,
    RULE_INSTANCES_TABLE_RANGE_KEY
  )

  let transactionsWithRulesApplied = applyRules(
    transactions,
    rules,
    RULE_INSTANCE_ID_FUNCTION_PARAMETER_NAME,
    RULE_INSTANCE_TRANSACTIONS_ITEMS_FUNCTION_PARAMETER_NAME,
  )

  // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
  let isEqual = compareTransactions(transactions, transactionsWithRulesApplied)

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
