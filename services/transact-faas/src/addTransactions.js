const aws = require('aws-sdk')
const axios = require('axios')
const _ = require('lodash')

const stroreTransactions = require('./storeTransactions')

const { RULES_URL } = process.env

const addTransaction = async (obj, conn) => {
  if (!obj.items) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }

  // service assigns recieved items as itemsUnderTestArray, then logs
  const itemsUnderTestArray = _.sortBy(obj.items, 'name')
  console.log('Item under test array: ', JSON.stringify(itemsUnderTestArray))

  // service POST /rules itemsUnderTestArray
  // const messageId = await sendMessageToQueue(
  //   itemsUnderTestArray,
  //   TRANSACT_TO_RULES_QUEUE
  // )
  // console.log('Initial id: ', messageId) //match with message returned from
  //
  // const responseFromRules = await receiveMessageFromQueue(
  //   RULES_TO_TRANSACT_QUEUE
  // )
  const responseFromRules = await axios.post(RULES_URL, itemsUnderTestArray)
  console.log('RESPONSE FROM RULES', responseFromRules)

  // sqs omits Message property if queue empty or messages not visible (in flight)
  if (responseFromRules.Messages) {
    const message = responseFromRules.Messages[0]

    console.log(
      'Returned id: ',
      message.MessageAttributes.InitialMessageId.StringValue
    )

    // await deleteMessageFromQueue(RULES_TO_TRANSACT_QUEUE, message.ReceiptHandle)
    const itemsStandardArray = _.sortBy(JSON.parse(message.Body), 'name')

    // JSON.Stringify to prettify aws console output
    console.log('Items standard array: ', JSON.stringify(itemsStandardArray))

    // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
    const isEqual = _.isEqualWith(
      itemsUnderTestArray,
      itemsStandardArray,
      (obj1, obj2) => {
        // Avoid comparing rules-generated uuid, rule_instance_id
        const { name: n1, price: p1, quantity: q1 } = obj1
        const { name: n2, price: p2, quantity: q2 } = obj1
        return n1 === n2 && p1 == p2 && q1 == q2
      }
    )

    if (!isEqual) {
      // Arrays are not equal, log error message with unidentical item arrays
      console.log(
        'UNEQUAL',
        JSON.stringify(itemsUnderTestArray),
        JSON.stringify(itemsStandardArray)
      )
      return false
    }

    // Arrays are equal, log success message with identical item arrays
    console.log(
      'EQUALITY',
      JSON.stringify(itemsUnderTestArray),
      JSON.stringify(itemsStandardArray)
    )
    stroreTransactions(itemsUnderTestArray)
    return true
  }

  return false
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
