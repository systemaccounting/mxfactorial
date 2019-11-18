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
  return service.put(params)
    .promise()
    .then(async data => {
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
      }
    }
    return service.delete(params)
      .promise()
      .then(async data => {
        console.log(`deleted connection_id: '${primaryKeyValue}'`)
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