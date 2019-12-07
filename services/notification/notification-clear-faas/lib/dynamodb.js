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

module.exports = {
  formatNotificationsToClear,
  batchWriteTable,
}