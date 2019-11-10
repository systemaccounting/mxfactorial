const putItem = (service, table, time, connectionId) => {
  let params = {
    TableName: table,
    Item: {
      connection_id: connectionId,
      timestamp: time
    }
  }
  return service.put(params)
    .promise()
    .then(async data => {
      console.log(`connectionId stored: ${connectionId}`)
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

const deleteConnection = (
  service,
  table,
  primaryKey,
  sortKey,
  connection
  ) => {
    let params = {
      TableName: table,
      Key: {
        [primaryKey]: connection.connection_id,
        [sortKey]: connection.timestamp
      }
    }
    return service.delete(params)
      .promise()
      .then(async data => {
        console.log(`connection_id for '${connection.account}' account deleted: ${connection.connection_id}`)
      })
      .catch(async err => {
        console.log(err, err.stack)
        throw err
      })
}

module.exports = {
  putItem,
  queryTable,
  deleteConnection
}