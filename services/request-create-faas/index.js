const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
// todo: integration tests
const {
  applyRules,
  getRules,
  queryTable
} = require('./src/applyRules')
const compareRequests = require('./src/compareRequests')
const storeRequests = require('./src/storeRequests')
const sendNotification = require('./src/sendNotification')

// env var inventory (avoid assigning to const):
// process.env.RULE_INSTANCES_TABLE_NAME

const STATUS_SUCCESS = 'success'
const STATUS_FAILED = 'failed'

// keySchema examples for rules:
// 1. creditor:Person2|name:petrol (any sale of petrol with Person2 as creditor)
// 2. name: (any request)
const anyItemKeySchema = 'name:' // applies to all requests
const rulesToQuery = [ anyItemKeySchema ] // array initd for extensibility
// todo: convert multi-service constants to env vars set in terraform
const RULE_INSTANCES_TABLE_RANGE_KEY = 'key_schema'
const RULE_INSTANCE_ID_FUNCTION_PARAMETER_NAME = 'ruleId'
const RULE_INSTANCE_TRANSACTIONS_ITEMS_FUNCTION_PARAMETER_NAME = 'items'

const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
  region: process.env.AWS_REGION
})

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

exports.handler = async event => {

  if (!event.items) {
    console.log('empty object received by resolver')
    return {
      status: STATUS_FAILED,
      message: 'please specify at least 1 request'
    }
  }

  const requests = event.items

  // todo: if debitor === creditor, return 'self payment' error

  const rules = await getRules(
    rulesToQuery,
    queryTable,
    ddb,
    process.env.RULE_INSTANCES_TABLE_NAME,
    RULE_INSTANCES_TABLE_RANGE_KEY
  )

  const requestsWithRulesApplied = applyRules(
    requests,
    rules,
    RULE_INSTANCE_ID_FUNCTION_PARAMETER_NAME,
    RULE_INSTANCE_TRANSACTIONS_ITEMS_FUNCTION_PARAMETER_NAME,
  )

  // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
  const isEqual = compareRequests(requests, requestsWithRulesApplied)

  if (!isEqual) {
    return {
      status: STATUS_FAILED,
      message: 'required items missing'
    }
  }

  const transactionId = uuid() // same for all request items, identifies set

  // Always ignore approval time fields sent from client
  const preparedItems = requests.map(item => {
    const {
      debitor_approval_time,
      creditor_approval_time,
      ...allowedItem
    } = item
    allowedItem.transaction_id = transactionId
    return allowedItem
  })

  const storedRequests = await storeRequests(
    preparedItems,
    event.graphqlRequestSender
  )

  const notification = {
    service: 'TRANSACT',
    message: storedRequests
  }

  await sendNotification(sns, process.env.NOTIFY_TOPIC_ARN, notification)

  return {
    status: STATUS_SUCCESS,
    data: storedRequests
  }

}
