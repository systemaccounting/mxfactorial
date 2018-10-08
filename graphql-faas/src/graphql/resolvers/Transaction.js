const AWS = require('aws-sdk')
const uuidv1 = require('uuid/v1')
AWS.config.update({ region: process.env.REGION })
AWS.config.apiVersion = { dynamodb: '2012-08-10' }
const documentClient = new AWS.DynamoDB.DocumentClient()
// see aws_dynamodb_table name in envs/us-east-1/prod/dynamodb.tf
const TABLE_NAME = 'transactions'
const TIMEUUID = uuidv1()


const GetTransactionResolver = arg => {
  if (!arg) {
    let params = {
      TableName : TABLE_NAME,
    }
    console.log('Sending request...')
    return documentClient.scan(params).promise()
      .then(data => {
        console.log('Receiving the data...')
        let matchSchema = obj => {
          let matchingObj = {}
          matchingObj.id = obj.id
          matchingObj.debitor = obj.debitor
          matchingObj.debitor_profile_latlng = obj.debitor_profile_latlng
          matchingObj.debitor_transaction_latlng = obj.debitor_transaction_latlng
          matchingObj.debitor_approval_time = obj.debitor_approval_time
          matchingObj.debitor_device = obj.debitor_device
          matchingObj.creditor = obj.creditor
          matchingObj.creditor_profile_latlng = obj.creditor_profile_latlng
          matchingObj.creditor_transaction_latlng = obj.creditor_transaction_latlng
          matchingObj.creditor_approval_time = obj.creditor_approval_time
          matchingObj.creditor_device = obj.creditor_device
          matchingObj.name = obj.name
          matchingObj.price = obj.price
          matchingObj.quantity = obj.quantity
          matchingObj.unit_of_measurement = obj.unit_of_measurement
          matchingObj.units_measured = obj.units_measured
          matchingObj.rule_instance_id = obj.rule_instance_id
          matchingObj.transaction_id = obj.transaction_id
          matchingObj.debit_approver = obj.debit_approver
          matchingObj.credit_approver = obj.credit_approver
          matchingObj.author = obj.author
          matchingObj.expiration_time = obj.expiration_time
          matchingObj.creditor_rejection_time = obj.creditor_rejection_time
          matchingObj.debitor_rejection_time = obj.debitor_rejection_time
          return matchingObj
        }
        let modifiedItemsToMatchSchema = data.Items.map(matchSchema)
        console.log(modifiedItemsToMatchSchema)
        return modifiedItemsToMatchSchema
      })
      .catch(error => {
        console.log('ERROR:', error)
        return error
      })
  }
  let params = {
    TableName: TABLE_NAME,
    ScanFilter: {
      'id': {
        ComparisonOperator: "CONTAINS",
        AttributeValueList: [`${arg}`]
      }
    }
  }
  return documentClient.scan(params).promise()
    .then(data => {
      console.log(data.Items)
      return data.Items
    })
    .catch(error => {
      console.log('ERROR:', error)
      return error
    })
}

const AddTransactionResolver = arg => {
  if (!arg) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }
  let transactionRecord = arg
  let params = {
    TableName: TABLE_NAME,
    Item: {
      "id": TIMEUUID,
      "debitor": transactionRecord.debitor,
      "debitor_profile_latlng": transactionRecord.debitor_profile_latlng,
      "debitor_transaction_latlng": transactionRecord.debitor_transaction_latlng,
      "debitor_approval_time": transactionRecord.debitor_approval_time,
      "debitor_device": transactionRecord.debitor_device,
      "creditor": transactionRecord.creditor,
      "creditor_profile_latlng": transactionRecord.creditor_profile_latlng,
      "creditor_transaction_latlng": transactionRecord.creditor_transaction_latlng,
      "creditor_approval_time": transactionRecord.creditor_approval_time,
      "creditor_device": transactionRecord.creditor_device,
      "name": transactionRecord.name,
      "price": transactionRecord.price,
      "quantity": transactionRecord.quantity,
      "unit_of_measurement": transactionRecord.unit_of_measurement,
      "units_measured": transactionRecord.units_measured,
      "rule_instance_id": transactionRecord.rule_instance_id,
      "transaction_id": transactionRecord.transaction_id,
      "debit_approver": transactionRecord.debit_approver,
      "credit_approver": transactionRecord.credit_approver,
      "author": transactionRecord.author,
      "expiration_time": transactionRecord.expiration_time,
      "creditor_rejection_time": transactionRecord.creditor_rejection_time,
      "debitor_rejection_time": transactionRecord.debitor_rejection_time
    }
  }
  return documentClient.put(params).promise()
    .then(data => {
      console.log(data)
      return transactionRecord
    })
    .catch(error => {
      console.log('ERROR:', error)
      return error
    })
}

module.exports = {
  GetTransactionResolver,
  AddTransactionResolver,
  TIMEUUID
}