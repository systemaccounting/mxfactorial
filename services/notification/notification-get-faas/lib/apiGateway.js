const sendMessageToClient = (service, connectionId, data) => {
  let params = {
    ConnectionId: connectionId, // event.requestContext.connectionId
    Data: JSON.stringify(data)
  }
  return service.postToConnection(params)
    .promise()
    .then(data => {
      if (data) {
        console.log(`sent: ${params.Data}`)
      }
      return
    })
    .catch(err => {
      console.log(err, err.stack)
      throw err
    })
}

module.exports = {
  sendMessageToClient
}