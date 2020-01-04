const sendNotification = (service, topicArn, notification) => {
  let params = {
    Message: JSON.stringify(notification),
    TopicArn: topicArn
  }
  return service.publish(params)
    .promise()
    .then(data => data)
    .catch(err => console.log(err, err.stack))
}

module.exports = sendNotification