const queryIndex = require('./dynamodb')

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

  // todo: test sendMessageToClient Data object type
})