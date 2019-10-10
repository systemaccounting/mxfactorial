const formatNotificationsToClear = notificationArray => {
  let ddbDeleteItems = []
  for (let i = 0; i < notificationArray.length; i++) {
    let { uuid, timestamp } = notificationArray[i]
    ddbDeleteItems.push({
      DeleteRequest: {
        Key: {
          uuid, timestamp
        }
      }
    })
  }
  return ddbDeleteItems
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

const queryIndex = (service, table, indexName, key, val) => {
  let params = {
    TableName: table,
    IndexName: indexName,
    KeyConditions: {
      [key]: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [ val ]
      }
    }
  }
  return service.query(params)
    .promise()
    .then(async data => {
      console.log(data.Items)
      return data.Items
    })
    .catch(async err => {
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
  formatNotificationsToClear,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
}