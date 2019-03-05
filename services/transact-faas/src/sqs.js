const aws = require('aws-sdk')
const sqs = new aws.SQS()

const sendMessageToQueue = (event, queueUrl) => {
  let params = {}
  params.MessageBody = JSON.stringify(event)
  params.QueueUrl = queueUrl
  params.DelaySeconds = 0
  return sqs.sendMessage(params)
  .promise()
  .then(data => data.MessageId)
  .catch(err => { console.error(err, err.stack) })
}

const receiveMessageFromQueue = queueUrl => {
  let params = {}
  params.QueueUrl = queueUrl
  params.AttributeNames = [ 'All' ]
  params.MessageAttributeNames = [ 'InitialMessageId' ]
  params.MaxNumberOfMessages = 1
  params.WaitTimeSeconds = 1
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
  })
  .catch(err => { console.log("Delete Error", err) })
}

module.exports = {
  sendMessageToQueue,
  receiveMessageFromQueue,
  deleteMessageFromQueue
}
