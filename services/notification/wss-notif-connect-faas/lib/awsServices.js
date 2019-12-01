const putItem = (
  service,
  table,
  primaryKey,
  primaryKeyValue,
  attributeKey,
  attributeValue
  ) => {
  let params = {
    TableName: table,
    Item: {
      [primaryKey]: primaryKeyValue,
      [attributeKey]: attributeValue
    }
  }
  console.log("connection storing :", JSON.stringify(params))
  return service.put(params)
    .promise()
    .then(async data => {
      // newly-added values not available: ReturnValues can only be ALL_OLD or NONE
      console.log(`connectionId stored: ${primaryKeyValue}`)
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
  primaryKeyValue,
  ) => {
    let params = {
      TableName: table,
      Key: {
        [primaryKey]: primaryKeyValue
      },
      ReturnValues: "ALL_OLD" // ReturnValues can only be ALL_OLD or NONE
    }
    return service.delete(params)
      .promise()
      .then(async data => {
        console.log('deleted connection: ', JSON.stringify(data.Attributes))
      })
      .catch(async err => {
        console.log(err, err.stack)
        throw err
      })
}

module.exports = {
  putItem,
  deleteConnection
}