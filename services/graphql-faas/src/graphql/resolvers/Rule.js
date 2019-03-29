const aws = require('aws-sdk')
const lambda = new aws.Lambda()

const GetRuleTransactionsResolver = async args => {
  if (!args.transactions) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }

  const params = {
    FunctionName: process.env.RULES_LAMBDA_ARN,
    Payload: JSON.stringify({ transactions: args.transactions })
  }

  const rulesResponse = await lambda.invoke(params).promise()
  console.log('Rules response: ', rulesResponse.Payload)
  return JSON.parse(rulesResponse.Payload)
}

module.exports = {
  GetRuleTransactionsResolver
}
