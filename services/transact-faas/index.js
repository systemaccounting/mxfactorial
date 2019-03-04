const mysql = require('mysql2')
const { addTransaction } = require('./src/addTransactions')
const {
  sendMessageToQueue,
  receiveMessageFromQueue,
  deleteMessageFromQueue
} = require('./src/sqs')

const TRANSACT_TO_RULES_QUEUE = process.env.TRANSACT_TO_RULES_QUEUE
const RULES_TO_TRANSACT_QUEUE = process.env.RULES_TO_TRANSACT_QUEUE

exports.handler = async (event) => {

  // add temporary property expected by rules index.js:21
  let rulesIntegrationDemo = event
  rulesIntegrationDemo.some = `transaction`
  // console.log(rulesIntegrationDemo)

  let messageId = await sendMessageToQueue(
    rulesIntegrationDemo,
    TRANSACT_TO_RULES_QUEUE
  )
  console.log(`initial id: ${messageId}`) //match with message returned from
  // receiveMessageFromQueue() and delete message.ReceiptHandle

  let responseFromRules = await receiveMessageFromQueue(RULES_TO_TRANSACT_QUEUE)
  // console.log(responseFromRules)
  // sqs omits Message property if queue empty or messages not visible (in flight)
  if (responseFromRules.Messages) {
    let message = responseFromRules.Messages[0]

    console.log(`returned id: ${message.MessageAttributes.InitialMessageId.StringValue}`)
    let functionFromRules = message.Body
    console.log(`${typeof functionFromRules}: ${functionFromRules}`)
    await deleteMessageFromQueue(RULES_TO_TRANSACT_QUEUE, message.ReceiptHandle)

    // let rule = new Function('transactions', functionFromRules)
    // transactionUnderTest = rule(event)

    // if (graphql transactions == rules transactions) {
    if (Object.keys(event).includes('creditor')) { //tmp to avoid storing test data

      //avoid creating until after event validation
      const connection = mysql.createConnection({
        user: process.env.USER,
        password: process.env.PASSWORD,
        host: process.env.HOST,
        database: 'mxfactorial',
        connectTimeout: 30000 //serverless aurora
      })

      let insert = await addTransaction(rulesIntegrationDemo, connection)
      return insert
    }
    // }
  }
}
