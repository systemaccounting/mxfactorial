const {
  formatNotificationsToClear,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
} = require('./awsServices')

const {
  pendingReceivedNotifications,
  batchWriteNotifications
} = require('../tests/utils/testData')

afterEach(() => {
  jest.clearAllMocks()
})

const mockAws = method => {
  return {
    [method]: jest.fn().mockImplementation(() => {
      return {
        promise: jest.fn().mockImplementation(() => {
          return {
            then: jest.fn().mockImplementation(() => {
              return {
                catch: jest.fn()
              }
            })
          }
        })
      }
    })
  }
}

describe('awsServices', () => {

  test('formatNotificationsToClear', () => {
    let expected = batchWriteNotifications
    let result = formatNotificationsToClear(pendingReceivedNotifications)
    expect(result).toEqual(expected)
  })

  test('batchwrite clear notifications param', () => {
    let ddb = mockAws('batchWrite')
    let table = 'testtable'
    let expected = {
      RequestItems: {
        [table]: batchWriteNotifications
      }
    }
    let formattedItems = formatNotificationsToClear(pendingReceivedNotifications)
    batchWriteTable(ddb, table, formattedItems)
    expect(ddb.batchWrite).toHaveBeenCalledWith(expected)
  })

  test('queryIndex params', () => {
    let ddb = mockAws('query')
    let table = 'testtable'
    let indexName = 'account-index'
    let key = 'account'
    let val = 'testaccount'
    let expected = {
      TableName: table,
      IndexName: indexName,
      KeyConditions: {
        [key]: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ val ]
        }
      }
    }
    queryIndex(ddb, table, indexName, key, val)
    expect(ddb.query).toHaveBeenCalledWith(expected)
  })

  test('sendMessageToClient params', () => {
    let apig = mockAws('postToConnection')
    let connectionId = '1234567'
    let data = {
      cleared: [
        {"account":"testaccount","time_uuid":"1234","message":"test message"}
      ]
    }
    let expected = {
      ConnectionId: connectionId,
      Data: JSON.stringify(data)
    }
    sendMessageToClient(apig, connectionId, data)
    expect(apig.postToConnection).toHaveBeenCalledWith(expected)
  })
})