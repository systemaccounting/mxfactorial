const updateItem = (
  service,
  table,
  partitionKey,
  sortKey,
  connectionId,
  timestamp,
  newAttributeKey,
  newAttributeValue,
  updateConditionExpression
  ) => {
  let params = {
    TableName: table,
    Key: {
      [partitionKey]: connectionId,
      [sortKey]: timestamp
    },
    ExpressionAttributeNames: {
      "#key": newAttributeKey
    },
    ExpressionAttributeValues: {
      ":value": newAttributeValue
    },
    UpdateExpression: `SET #key = :value`,
    ConditionExpression: `${updateConditionExpression}(#key)` // 'attribute_not_exists'
  }
  return service.update(params)
    .promise()
    .then(async data => {
      console.log(`${newAttributeValue} added to ${connectionId} connection_id record`)
    })
    .catch(async err => {
      console.log(err, err.stack)
      throw err
    })
}

const queryTable = (service, table, key, val) => {
  let params = {
    TableName: table,
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

module.exports = {
  updateItem,
  queryTable,
  formatNotificationsToClear,
  batchWriteTable,
  queryIndex
}