const { sendMessageToQueue } = require('./src/sqs')
const applyRules = require('./src/applyRules')

const RULES_TO_TRANSACT_QUEUE = process.env.RULES_TO_TRANSACT_QUEUE

exports.handler = async event => {
  // if coming from transact through sqs which adds Records property to event object:
  if (event.Records) {
    // no need to delete message from queue per standard instructions in
    // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples-send-receive-messages.html
    // deleted automatically by terraform resource "aws_lambda_event_source_mapping" "transact_to_rules"
    let messageFromTransactSQS = event.Records[0]
    let messageIdFromTransact = messageFromTransactSQS.messageId
    // console.log("id: " + messageIdFromTransact)
    console.log('Message received from transact: ', messageFromTransactSQS.body)
    const transactions = JSON.parse(messageFromTransactSQS.body)

    return await sendMessageToQueue(
      applyRules(transactions),
      messageIdFromTransact,
      RULES_TO_TRANSACT_QUEUE
    )
  }

  // if coming from graphql:
  return applyRules(event.transactions)
}
