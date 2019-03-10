const aws = require('aws-sdk')
const lambda = new aws.Lambda()
const {
  sendMessageToQueue,
  receiveMessageFromQueue,
  deleteMessageFromQueue
} = require('./sqs')

const { TRANSACT_TO_RULES_QUEUE, RULES_TO_TRANSACT_QUEUE } = process.env

const addTransaction = async (obj, conn) => {
  if (!obj.items) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }

  // service assigns recieved items as itemsUnderTestArray, then logs
  const itemsUnderTestArray = obj.items
  console.log('Item under test array: ', itemsUnderTestArray)

  // service POST /rules itemsUnderTestArray
  const messageId = await sendMessageToQueue(
    itemsUnderTestArray,
    TRANSACT_TO_RULES_QUEUE
  )
  console.log('Initial id: ', messageId) //match with message returned from

  const responseFromRules = await receiveMessageFromQueue(
    RULES_TO_TRANSACT_QUEUE
  )
  console.log('Items standard array: ', responseFromRules)

  return itemsUnderTestArray
  // const params = {
  //   FunctionName: process.env.RULES_LAMBDA_ARN,
  //   Payload: JSON.stringify({ items: 'items' })
  // }
  // return lambda
  //   .invoke(params)
  //   .promise()
  //   .then(data => {
  //     return data
  //   })
  //   .catch(err => {
  //     console.log('ERROR', err)
  //   })

  // const transactionRecord = obj
  // var returnedRecord = transactionRecord
  // return obj;
  // conn.connect()
  // console.log(transactionRecord)
  // return conn.promise().query(
  //   `INSERT INTO transactions (` +
  //   `debitor,` +
  //   `debitor_profile_latlng,` +
  //   `debitor_transaction_latlng,` +
  //   `debitor_approval_time,` +
  //   `debitor_device,` +
  //   `creditor,` +
  //   `creditor_profile_latlng,` +
  //   `creditor_transaction_latlng,` +
  //   `creditor_approval_time,` +
  //   `creditor_device,` +
  //   `name,` +
  //   `price,` +
  //   `quantity,` +
  //   `unit_of_measurement,` +
  //   `units_measured,` +
  //   `rule_instance_id,` +
  //   `transaction_id,` +
  //   `debit_approver,` +
  //   `credit_approver,` +
  //   `author,` +
  //   `expiration_time,` +
  //   `creditor_rejection_time,` +
  //   `debitor_rejection_time` +
  //   `) VALUES (` +
  //   `?,?,?,?,?,?,?,?,?,?,` +
  //   `?,?,?,?,?,?,?,?,?,?,` +
  //   `?,?,?` +
  //   `);`,
  //   [
  //   transactionRecord.debitor,
  //   transactionRecord.debitor_profile_latlng,
  //   transactionRecord.debitor_transaction_latlng,
  //   transactionRecord.debitor_approval_time,
  //   transactionRecord.debitor_device,
  //   transactionRecord.creditor,
  //   transactionRecord.creditor_profile_latlng,
  //   transactionRecord.creditor_transaction_latlng,
  //   transactionRecord.creditor_approval_time,
  //   transactionRecord.creditor_device,
  //   transactionRecord.name,
  //   transactionRecord.price,
  //   transactionRecord.quantity,
  //   transactionRecord.unit_of_measurement,
  //   transactionRecord.units_measured,
  //   transactionRecord.rule_instance_id,
  //   transactionRecord.transaction_id,
  //   transactionRecord.debit_approver,
  //   transactionRecord.credit_approver,
  //   transactionRecord.author,
  //   transactionRecord.expiration_time,
  //   transactionRecord.creditor_rejection_time,
  //   transactionRecord.debitor_rejection_time
  //   ],
  //   (err, rows, fields) => {
  //     if (err) {
  //       console.log(err)
  //       return err
  //     }
  //     console.log(rows)
  //     return rows
  //   })
  // .then(data => {
  //   // conn.destroy()
  //   returnedRecord.id = data[0].insertId
  //   // console.log(data)
  //   // console.log(returnedRecord)
  //   return returnedRecord
  // })
  // .catch(error => {
  //   // conn.destroy()
  //   console.log('ERROR:', error)
  //   return error
  // })
}

module.exports = {
  addTransaction
}
