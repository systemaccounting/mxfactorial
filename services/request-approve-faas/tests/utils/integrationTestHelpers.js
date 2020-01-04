const invokeLambda = (
  service,
  lambdaArn,
  items,
  graphqlRequestSender
  ) => {
  const params = {
    FunctionName: lambdaArn,
    Payload: JSON.stringify({ items, graphqlRequestSender })
  }
  return service
    .invoke(params)
    .promise()
    .then(data => {
      let response = JSON.parse(data.Payload)
      return response
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

// dirty ugly integration test helper
const tearDownNotifications = async (
  ddbService,
  transactionIDs,
  notificationMinimumCount
  ) => {
  // https://stackoverflow.com/questions/14249506/how-can-i-wait-in-node-js-javascript-l-need-to-pause-for-a-period-of-time#comment88208673_41957152
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  // delete test notifications added in dynamodb
  for (let notificationID of transactionIDs) {
    let notificationsToDelete
    attemptloop: // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label
    for (let attempt = 1; attempt < 5; attempt++) { // retry delayed notifications delivered by sns
      notificationsToDelete = await queryDynamaDbTable(
        ddbService,
        process.env.NOTIFICATIONS_TABLE_NAME,
        'uuid',
        notificationID
      )
      if (notificationsToDelete.length < notificationMinimumCount) { // notifications not in dynamodb yet
        await sleep(3000) // wait 3 seconds
        continue attemptloop // start over
      } else {
        break attemptloop
      }
    }
    if (notificationsToDelete.length < notificationMinimumCount) { // log failure if attempts fail
      console.log('failed to find and delete notifications from test')
    } else {
      await deleteMultipleNotifications( // delete notifications
        ddbService,
        process.env.NOTIFICATIONS_TABLE_NAME,
        notificationsToDelete
      )
    }
  }
}

module.exports = {
  invokeLambda,
  queryPgTable,
  deleteFromPgTable,
  tearDownNotifications
}