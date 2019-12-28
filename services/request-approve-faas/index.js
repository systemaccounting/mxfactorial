const AWS = require('aws-sdk')
const Sequelize = require('sequelize')

// todo: integration tests
const {
  applyRules,
  getRules,
  queryTable
} = require('./src/applyRules')

const compareRequestItems = require('./src/compareRequestItems')
const compareRequestRuleItems = require('./src/compareRequestRuleItems')
const getRequest = require('./src/getRequest')
const updateRequest = require('./src/updateRequest')
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
    console.log(`Empty object received by resolver`)
    return {
      status: STATUS_FAILED,
      message: 'Please specify at least 1 request'
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
      return {
        status: STATUS_FAILED,
        message: 'mixed transaction ids detected'
      }
    }
    // involve graphqlRequestSender
    if (!requestItems[i].rule_instance_id) { // rule items tested later
      if (
        requestItems[i].creditor !== graphqlRequestSender
        && requestItems[i].debitor !== graphqlRequestSender
        && requestItems[i].author !== graphqlRequestSender
        ) {
          return {
            status: STATUS_FAILED,
            message: 'unauthenticated account detected in items'
          }
      }
      if (currentAccountRole === 'creditor') {
        if (requestItems[i].creditor_approval_time) {
          return {
            status: STATUS_FAILED,
            message: 'previously approved credit request item detected'
          }
        }
      }
      // otherwise, test debitor approval
      if (requestItems[i].debitor_approval_time) {
        return {
          status: STATUS_FAILED,
          message: 'previously approved debit request item detected'
        }
      }
    }
  }

  let initiallyStoredRequest = await getRequest(
    sequelize,
    requestItems[0].transaction_id // safe after testing
  )

  let isRequestEqual = compareRequestItems(initiallyStoredRequest, requestItems)

  if (!isRequestEqual) {
    return {
      status: STATUS_FAILED,
      message: '0 matching requests found'
    }
  }

  let rules = await getRules(
    rulesToQuery,
    queryTable,
    ddb,
    process.env.RULE_INSTANCES_TABLE_NAME,
    RULE_INSTANCES_TABLE_RANGE_KEY
  )

  let requestWithRulesApplied = applyRules(
    requestItems,
    rules,
    RULE_INSTANCE_ID_FUNCTION_PARAMETER_NAME,
    RULE_INSTANCE_TRANSACTIONS_ITEMS_FUNCTION_PARAMETER_NAME,
  )

  // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
  let isWithRulesEqual = compareRequestRuleItems(requestItems, requestWithRulesApplied)

  if (!isWithRulesEqual) {
    return {
      status: STATUS_FAILED,
      message: 'required items missing'
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
