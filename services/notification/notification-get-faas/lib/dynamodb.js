const updateItem = (
  service,
  table,
  partitionKey,
  partitionKeyValue,
  newAttributeKey,
  newAttributeValue,
  updateConditionExpression
  ) => {
  let params = {
    TableName: table,
    Key: {
      [partitionKey]: partitionKeyValue
    },
    ExpressionAttributeNames: {
      "#key": newAttributeKey
    },
    ExpressionAttributeValues: {
      ":value": newAttributeValue
    },
    UpdateExpression: `SET #key = :value`,
    ConditionExpression: `${updateConditionExpression}(#key)`, // 'attribute_not_exists'
    ReturnValues: "ALL_NEW"
  }
  return service.update(params)
    .promise()
    .then(async data => {
      console.log("new attribute values added: ", JSON.stringify(data.Attributes))
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

module.exports = {
  updateItem,
  queryIndex,
  queryTable,
}