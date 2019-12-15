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

const setNotificationLimit = (requestedValue, limitValue) => {
  return (requestedValue > limitValue) ? limitValue : requestedValue
}

const computeRequestedNotificationCount = (
  websocketMsgObject,
  setLimitFn,
  limitValue
  ) => {
  // if count value empty, set to notification retrieval limit
  let requestedNotifictionCount
  if (!websocketMsgObject.count) {
    requestedNotifictionCount = limitValue
    return setLimitFn(requestedNotifictionCount, limitValue)
  }
  // if count NaN, set to notification retrieval limit, otherwise
  // pass requested count
  if (!Number.isInteger(websocketMsgObject.count)) {
    if (Number.isNaN(Number.parseInt(websocketMsgObject.count))) {
      requestedNotifictionCount = limitValue
    } else {
      requestedNotifictionCount = websocketMsgObject.count
    }
    return setLimitFn(requestedNotifictionCount, limitValue)
  }
  // if count greater than limit, set to limit
  requestedNotifictionCount = websocketMsgObject.count
  return setLimitFn(requestedNotifictionCount, limitValue)
}

module.exports = {
  queryIndex,
  setNotificationLimit,
  computeRequestedNotificationCount
}
