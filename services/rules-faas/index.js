const {
  sendMessageToQueue
} = require('./src/sqs')

const RULES_TO_TRANSACT_QUEUE = process.env.RULES_TO_TRANSACT_QUEUE

exports.handler = async (event) => {
  // console.log(event)

  const queriedRule = transactions => `const payTax = (${transactions}) => rules-applied ${transactions}`

  // if coming from transact through sqs which adds Records property to event object:
  if (event.Records) {
    // no need to delete message from queue per standard instructions in
    // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples-send-receive-messages.html
    // deleted automatically by terraform resource "aws_lambda_event_source_mapping" "transact_to_rules"
    let messageFromTransactSQS = event.Records[0]
    let messageIdFromTransact = messageFromTransactSQS.messageId
    // console.log("id: " + messageIdFromTransact)
    let messageBody = JSON.parse(messageFromTransactSQS.body)
    let ruleInstance = queriedRule(messageBody.some)
    // console.log(ruleInstance)

    return await sendMessageToQueue(ruleInstance, messageIdFromTransact, RULES_TO_TRANSACT_QUEUE)
  }

  // if coming from graphql:
  // let rulesAppliedTransactions = queriedRule(event)
  // return rulesAppliedTransactions
  return event
}