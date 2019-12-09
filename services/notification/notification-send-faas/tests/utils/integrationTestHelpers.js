const createNotifications = (service, notifications, table) => {
  let ddbPutItems = []
  for (let i = 0; i < notifications.length; i++) {
    let { account, time_uuid, message } = notifications[i]
    ddbPutItems.push({
      PutRequest: {
        Item: {
          account, time_uuid, message
        }
      }
    })
  }
  let params = {
    RequestItems: {
      [table]: ddbPutItems
    }
  }
  return service.batchWrite(params)
    .promise()
    .then(data => {
      // console.log(data)
      if (!Object.keys(data.UnprocessedItems).length) {
        return notifications
      }
    })
    .catch(err => console.log(err, err.stack))
}

const deleteNotifications = (service, table, notifications) => {
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

const queryMultipleItems = (service, table, notifications) => {
  let ddbGetItemKeys = []
  for (let i = 0; i < notifications.length; i++) {
    let { uuid, timestamp } = notifications[i]
    ddbGetItemKeys.push({
      uuid,
      timestamp
    })
  }
  let params = {
    RequestItems: {
      [table]: {
        Keys: ddbGetItemKeys
      }
    }
  }
  console.log(JSON.stringify(params))
  return service.batchGet(params)
  .promise()
  .then(data => {
    console.log(data.Responses[table])
    return data.Responses[table]
  })
  .catch(err => {
    console.log(err)
    return err
  })
}

const createAccount = (service, clientId, account, secret) => {
  let params = {
    ClientId: clientId,
    Password: secret,
    Username: account,
    UserAttributes: [
      {
        Name: 'custom:account',
        Value: account
      }
    ]
  }
  return service.signUp(params)
    .promise()
    .then(data => {
      // console.log(data)
      return data
    })
    .catch(err => {
      console.log(err)
      throw err
    })
}

const deleteAccount = (service, poolId, account) => {
  let params = {
    UserPoolId: poolId,
    Username: account
  }
  return service.adminDeleteUser(params)
    .promise()
    .then(data => {
      // console.log(data)
      return data
    })
    .catch(err => {
      console.log(err)
      return err
    })
}

const getToken = async (service, clientId, account, secret) => {
  let params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: clientId,
    AuthParameters: {
      'USERNAME': account,
      'PASSWORD': secret
    }
  }
  return service.initiateAuth(params)
    .promise()
    .then(data => data.AuthenticationResult.IdToken)
    .catch(err => err)
}

const shapeClearNotificationsRequest = notifications => {
  let notificationsToClear = []
  for (notification of notifications) {
    // console.log('clearing' + JSON.stringify(notification))
    notificationsToClear.push(notification)
  }
  let clearNotificationsRequest = {
    action: 'clearnotifications',
    notifications: notificationsToClear
  }
  return JSON.stringify(clearNotificationsRequest)
}

const sendNotifications = (service, topicArn, notifications) => {
  let params = {
    Message: JSON.stringify(notifications),
    TopicArn: topicArn
  }
  return service.publish(params)
    .promise()
    .then(data => data)
    .catch(err => {
      throw err
    })
}

const queryIndex = (
  service, table, indexName, key, val
  ) => {
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
      // console.log(data.Items)
      return data.Items
    })
    .catch(async err => {
      console.log(err, err.stack)
      throw err
    })
}

const queryTable = (service, account) => {
  return service.findAll({
    where: { account }
  })
}

const insert = (service, connectionId, connectedAt, account) => {
  return service.create({
    connection_id: connectionId,
    created_at: null,
    epoch_created_at: connectedAt,
    account: account
  })
}

const deleteFromTable = (service, account) => service.destroy({ where: { account } })

module.exports = {
  createNotifications,
  deleteNotifications,
  queryMultipleItems,
  createAccount,
  deleteAccount,
  getToken,
  shapeClearNotificationsRequest,
  sendNotifications,
  queryIndex,
  queryTable,
  insert,
  deleteFromTable
}