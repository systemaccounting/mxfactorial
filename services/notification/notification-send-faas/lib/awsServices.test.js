const {
  idAndTimestampNotifications,
  formatPendingNotifications,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
} = require('./awsServices')

const {
  pendingNotifications,
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

const mockId = jest.fn()
  .mockImplementationOnce(() => '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd21-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd22-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd23-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd24-e60b-11e9-a7a9-2b4645cb9b8c')
  .mockImplementationOnce(() => '8f93fd25-e60b-11e9-a7a9-2b4645cb9b8c')

const mockTime = {
  now: jest.fn()
  .mockImplementationOnce(() => 1570139563495635)
  .mockImplementationOnce(() => 1570139563495685)
  .mockImplementationOnce(() => 1570139563495694)
  .mockImplementationOnce(() => 1570139563495700)
  .mockImplementationOnce(() => 1570139563495706)
  .mockImplementationOnce(() => 1570139563495713)
}

describe('awsServices', () => {

  test('ids and timestamps added to received notifications', () => {
    let expected = pendingReceivedNotifications
    let result = idAndTimestampNotifications(mockId, mockTime, pendingNotifications)
    expect(result).toEqual(expected)
  })

  test('batchwrite items formatted', () => {
    let expected = batchWriteNotifications
    let result = formatPendingNotifications(pendingReceivedNotifications)
    expect(result).toEqual(expected)
  })

  test('batchwrite notifications param', () => {
    let ddb = mockAws('batchWrite')
    let table = 'testtable'
    let expected = {
      RequestItems: {
        [table]: batchWriteNotifications
      }
    }
    let formattedItems = formatPendingNotifications(pendingReceivedNotifications)
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