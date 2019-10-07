const {
  queryIndex,
  queryTable,
  sendMessageToClient
} = require('./awsServices')

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
  test('queryTable params', async () => {
    let ddb = mockAws('query')
    let expected = {
      TableName: 'testtable',
      KeyConditions: {
        connection_id: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ '123456789' ]
        }
      }
    }
    await queryTable(
      ddb,
      expected.TableName,
      'connection_id',
      expected.KeyConditions.connection_id.AttributeValueList[0]
    )
    await expect(ddb.query).toHaveBeenCalledWith(expected)
  })

  test('queryIndex params', async () => {
    const ddb = mockAws('query')
    let expected = {
      TableName: 'testtable',
      IndexName: 'test-index',
      KeyConditions: {
        account: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ 'testaccount' ]
        }
      },
      Limit: 100,
      ScanIndexForward: false
    }
    await queryIndex(
      ddb,
      expected.TableName,
      expected.IndexName,
      expected.Limit,
      'account',
      expected.KeyConditions.account.AttributeValueList[0]
    )
    await expect(ddb.query).toHaveBeenCalledWith(expected)
  })

  test('sendMessageToClient params', async () => {
    const ws = mockAws('postToConnection')
    let expected = {
      ConnectionId: '123456789',
      Data: "{\"account\":\"FakerAccount4\",\"messsage\":\"testmessage\"}"
    }
    await sendMessageToClient(
      ws,
      expected.ConnectionId,
      { account: 'FakerAccount4', messsage: 'testmessage' }
    )
    await expect(ws.postToConnection).toHaveBeenCalledWith(expected)
  })

  // todo: test sendMessageToClient Data object type
})