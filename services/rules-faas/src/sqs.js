const aws = require('aws-sdk')
const sqs = new aws.SQS()

const sendMessageToQueue = (queriedRule, messageId, queueUrl) => {
  let params = {}
  params.MessageBody = JSON.stringify(queriedRule)
  params.QueueUrl = queueUrl
  params.DelaySeconds = 0
  let messageAttributes = {}
  messageAttributes.InitialMessageId = {
    DataType: "String",
    StringValue: messageId
  }
  params.MessageAttributes = messageAttributes
  // console.log(params)
  return sqs.sendMessage(params)
  .promise()
  .then(data => {
      let responseFromQueue = data
      // console.log("id: " + responseFromQueue.MessageId)
      // console.log(responseFromQueue)
      return responseFromQueue.MessageId
    })
  .catch(err => { console.error(err, err.stack) })
}

const receiveMessageFromQueue = (queueUrl) => {
  let params = {}
  params.QueueUrl = queueUrl
  // params.AttributeNames = [ 'All' ]
  params.MaxNumberOfMessages = 1
  params.WaitTimeSeconds = 0
  params.VisibilityTimeout = 0
  return sqs.receiveMessage(params)
  .promise()
  .then(data => data)
  .catch(err => console.error(err, err.stack))
}

const deleteMessageFromQueue = (queueUrl, receiptHandle) => {
  let params = {}
  params.QueueUrl = queueUrl
  params.ReceiptHandle = receiptHandle
  return sqs.deleteMessage(params)
  .promise()
  .then(data => {
    console.log("Message Deleted", data)
    return data
  })
  .catch(err => { console.log("Delete Error", err) })
}

module.exports = {
  sendMessageToQueue,
  receiveMessageFromQueue,
  deleteMessageFromQueue
}
