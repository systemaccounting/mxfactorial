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

const queryIndex = (
  service,
  table,
  index,
  limit,
  key,
  val,
  ascendingTimestamps=false
  ) => {
  let params = {
    TableName: table,
    IndexName: index,
    KeyConditions: {
      [key]: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [ val ]
      }
    },
    Limit: limit,
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
    // ScanIndexForward default = false (descending timestamps)
    ScanIndexForward: ascendingTimestamps
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
  queryIndex,
  queryTable,
  sendMessageToClient
}