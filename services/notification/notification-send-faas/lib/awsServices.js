const formatPendingNotifications = notificationArray => {
  let ddbPutFormattedItems = []
  for (notification of notificationArray) {
    let {
      uuid,
      timestamp,
      human_timestamp,
      account,
      message
    } = notification
    ddbPutFormattedItems.push({
      PutRequest: {
        Item: {
          uuid,
          timestamp,
          human_timestamp,
          account,
          message
        }
      }
    })
  }
  return ddbPutFormattedItems
}

const batchWriteTable = (service, table, formattedItems) => {
  let params = {
    RequestItems: {
      [table]: formattedItems
    }
  }
  return service.batchWrite(params)
    .promise()
    .then(data => {
      console.log(data)
      if (!Object.keys(data.UnprocessedItems).length) {
        return
      } // low priority todo: else handle unprocessed items
    })
    .catch(err => {
      console.log(err, err.stack)
      throw err
    })
}

const sendMessageToClient = (service, connectionId, data) => {
  let params = {
    ConnectionId: connectionId, // event.requestContext.connectionId
    Data: JSON.stringify(data)
  }
  return service.postToConnection(params)
    .promise()
    .then(data => {
      console.log('sent: ' + params.Data)
      return
    })
    .catch(err => {
      console.log(err, err.stack)
      throw err
    })
}

module.exports = {
  formatPendingNotifications,
  batchWriteTable,
  sendMessageToClient
}