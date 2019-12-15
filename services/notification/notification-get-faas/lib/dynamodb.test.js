const {
  queryIndex,
  setNotificationLimit,
  computeRequestedNotificationCount
} = require('./dynamodb')

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

describe('dynamodb', () => {
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

  test('setNotificationLimit returns limit from exceeded limit', () => {
    const testlimit = 20
    const testrequested = 21
    const result = setNotificationLimit(testlimit, testrequested)
    expect(result).toBe(testlimit)
  })

  test('setNotificationLimit returns requested', () => {
    const testlimit = 20
    const testrequested = 19
    const result = setNotificationLimit(testlimit, testrequested)
    expect(result).toBe(testrequested)
  })

  test('setNotificationLimit returns limit requested', () => {
    const testlimit = 20
    const testrequested = 20
    const result = setNotificationLimit(testlimit, testrequested)
    expect(result).toBe(testrequested)
  })

  test('computeRequestedNotificationCount returns 20 from empty request count', () => {
    const mockwebsocketmessage = {
      action: "getnotifications",
      token: "testtoken",
    }
    const result = computeRequestedNotificationCount(
      mockwebsocketmessage,
      setNotificationLimit,
      parseInt(process.env.NOTIFICATION_RETRIEVAL_LIMIT_COUNT),
    )
    expect(result).toBe(20)
  })

  test('computeRequestedNotificationCount returns 20 from NaN request count', () => {
    const mockwebsocketmessage = {
      action: "getnotifications",
      token: "testtoken",
      count: "notanumber"
    }
    const result = computeRequestedNotificationCount(
      mockwebsocketmessage,
      setNotificationLimit,
      parseInt(process.env.NOTIFICATION_RETRIEVAL_LIMIT_COUNT),
    )
    expect(result).toBe(20)
  })

  test('computeRequestedNotificationCount returns requested count', () => {
    const expectedcount = 19
    const mockwebsocketmessage = {
      action: "getnotifications",
      token: "testtoken",
      count: expectedcount
    }
    const result = computeRequestedNotificationCount(
      mockwebsocketmessage,
      setNotificationLimit,
      parseInt(process.env.NOTIFICATION_RETRIEVAL_LIMIT_COUNT),
    )
    expect(result).toBe(expectedcount)
  })

  // todo: test sendMessageToClient Data object type
})