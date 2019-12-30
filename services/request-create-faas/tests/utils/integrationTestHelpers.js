const invokeLambda = (service, args, graphqlRequestSender) => {
  const params = {
    FunctionName: process.env.REQUEST_CREATE_LAMBDA_ARN,
    Payload: JSON.stringify({
      items: args.items,
      graphqlRequestSender
    })
  }
  return service
    .invoke(params)
    .promise()
    .then(data => {
      let response = JSON.parse(data.Payload)
      return response.data
    })
    .catch(err => {
      console.log(err.message)
      throw new Error(err.message)
    })
}

const queryPgTable = (service, key, val) => {
  return service.findAll({
    where: { [key]: val }
  })
}

const deleteFromPgTable = (service, key, val) => service.destroy(
  {
    where: { [key]: val },
    returning: 1
  }
)

const queryDynamaDbTable = (service, table, hashKey, hashVal) => {
  let params = {
    TableName: table,
    KeyConditionExpression: '#hkey = :hval',
    ExpressionAttributeNames: {
      '#hkey': hashKey
    },
    ExpressionAttributeValues: {
      ':hval': hashVal
    }
  }
  return service.query(params)
    .promise()
    .then(async data => {
      // console.log(data.Items)
      return data.Items
    })
    .catch(async err => {
      console.log(err, err.stack)
      throw err
    })
}

const deleteMultipleNotifications = (service, table, notifications) => {
  let ddbDeleteItems = []
  for (let i = 0; i < notifications.length; i++) {
    let { uuid, timestamp } = notifications[i]
    ddbDeleteItems.push({
      DeleteRequest: {
        Key: { uuid, timestamp }
      }
    })
  }
  let params = {
    RequestItems: {
      [table]: ddbDeleteItems
    }
  }
  return service.batchWrite(params)
    .promise()
    .then(data => {
      // console.log(data)
      if (!Object.keys(data.UnprocessedItems).length) {
        return
      }
    })
    .catch(err => console.log(err, err.stack))
}


module.exports = {
  invokeLambda,
  queryPgTable,
  deleteFromPgTable,
  queryDynamaDbTable,
  deleteMultipleNotifications
}