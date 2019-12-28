const AWS = require('aws-sdk')

const lambda = new AWS.Lambda()
const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

const getRules = async (
  rulesToQuery,
  queryFunc,
  service,
  tableName,
  rangeKey
  ) => {
  let rules = []
  for (ruleSchema of rulesToQuery) {
    let partialList = await queryFunc(
      service,
      tableName,
      rangeKey,
      ruleSchema
    )
    rules.push(...partialList)
  }
  return rules
}

const queryTable = (service, table, rangeKey, rangeVal) => {
  let params = {
    TableName: table,
    KeyConditionExpression: rangeKey + ' = :a',
    ExpressionAttributeValues: {
      ':a': rangeVal
    }
  }
  return service.query(params)
    .promise()
    .then(async data => {
      // console.log(data.Items)
      return data.Items
    })
    .catch(async err => {
      console.log(err, err.stack)
      throw err
    })
}

const GetRuleTransactionsResolver = async args => {
  if (!args.transactions) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }

  const params = {
    FunctionName: process.env.RULES_FAAS_ARN,
    Payload: JSON.stringify({ items: args.transactions })
  }

  const rulesResponse = await lambda.invoke(params).promise()
  console.log('Rules response: ', rulesResponse.Payload)
  return JSON.parse(rulesResponse.Payload)
}

const GetRuleInstanceResolver = args => {

  // keySchema examples for rules:
  // 1. creditor:Person2|name:petrol (any sale of petrol with Person2 as creditor)
  // 2. name: (any transaction)
  const rulesToQuery = args

  // todo: convert multi-service constants to env vars set in terraform
  const RULE_INSTANCES_TABLE_RANGE_KEY = 'key_schema'

  return getRules(
    rulesToQuery,
    queryTable,
    ddb,
    process.env.RULE_INSTANCES_TABLE_NAME,
    RULE_INSTANCES_TABLE_RANGE_KEY
  )
}

module.exports = {
  GetRuleTransactionsResolver,
  GetRuleInstanceResolver
}
