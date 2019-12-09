const {
  formatPendingNotifications,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
} = require('./awsServices')

const {
  pendingReceivedNotifications,
  batchWriteNotifications
} = require('../tests/utils/testData')

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

  test('items formatted for batchWrite', () => {
    let result = formatPendingNotifications(pendingReceivedNotifications)
    expect(result).toEqual(batchWriteNotifications)
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

  test('sendMessageToClient params', () => {
    let apig = mockAws('postToConnection')
    let connectionId = '1234567'
    let data = {
      pending: [
        {
          "account":"testaccount",
          "time_uuid":"1234",
          "message":"test message"
        }
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