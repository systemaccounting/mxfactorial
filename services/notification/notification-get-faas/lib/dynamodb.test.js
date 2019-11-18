const {
  updateItem,
  queryIndex,
  queryTable,
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
  test('updateItem params', () => {
    let ddb = mockAws('update')
    let testtable = 'testtable'
    let testpartitionKey = 'testpartitionkey'
    let testconnectionid = 'testconnectionid'
    let testattributekey = 'testattributekey'
    let testattributevalue = 'testattributevalue'
    let testupdateconditionexpression = 'testupdateconditionexpression'
    let expected = {
      TableName: testtable,
      Key: {
        [testpartitionKey]: testconnectionid
      },
      ExpressionAttributeNames: {
        "#key": testattributekey
      },
      ExpressionAttributeValues: {
        ":value": testattributevalue
      },
      UpdateExpression: `SET #key = :value`,
      ConditionExpression: `${testupdateconditionexpression}(#key)` // 'attribute_not_exists'
    }
    updateItem(
      ddb,
      testtable,
      testpartitionKey,
      testconnectionid,
      testattributekey,
      testattributevalue,
      testupdateconditionexpression
    )
    expect(ddb.update).toHaveBeenCalledWith(expected)
  })

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

  // todo: test sendMessageToClient Data object type
})