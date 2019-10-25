const AWS = require('aws-sdk')

const {
  applyRules,
  getRules,
  queryTable
} = require('./src/applyRules')

// env var inventory (avoid assigning to const):
// RULE_INSTANCES_TABLE_NAME

// keySchema examples for rules:
// 1. creditor:Person2|name:petrol (any sale of petrol with Person2 as creditor)
// 2. name: (any transaction)
const anyItemKeySchema = 'name:' // applies to all transactions
const rulesToQuery = [ anyItemKeySchema ]
// todo: convert multi-service constants to env vars set in terraform
const RULE_INSTANCES_TABLE_RANGE_KEY = 'key_schema'
const RULE_INSTANCE_ID_FUNCTION_PARAMETER_NAME = 'ruleId'
const RULE_INSTANCE_TRANSACTIONS_ITEMS_FUNCTION_PARAMETER_NAME = 'transactionItems'

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

exports.handler = async event => {
  console.log(event)
  if (!Object.keys(event).length) {
    console.log('warming up...')
    return
  }
  let rules = await getRules(
    rulesToQuery,
    queryTable,
    ddb,
    process.env.RULE_INSTANCES_TABLE_NAME,
    RULE_INSTANCES_TABLE_RANGE_KEY
  )

  let transactionsWithRulesApplied = applyRules(
    event.transactions,
    rules,
    RULE_INSTANCE_ID_FUNCTION_PARAMETER_NAME,
    RULE_INSTANCE_TRANSACTIONS_ITEMS_FUNCTION_PARAMETER_NAME,
  )

  return transactionsWithRulesApplied
}
