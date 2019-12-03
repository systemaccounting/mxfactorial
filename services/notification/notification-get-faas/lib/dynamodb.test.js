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
    let expected = {
      TableName: testtable,
      Key: {
        [testpartitionKey]: testconnectionid
      },
      ExpressionAttributeNames: {
        "#pk": testpartitionKey,
        "#newkey": testattributekey,
      },
      ExpressionAttributeValues: {
        ":pkv": testconnectionid,
        ":newval": testattributevalue,
      },
      UpdateExpression: `SET #newkey = :newval`,
      ConditionExpression: `#pk = :pkv and attribute_not_exists(#newkey)`,
      ReturnValues: "ALL_NEW"
    }
    updateItem(
      ddb,
      testtable,
      testpartitionKey,
      testconnectionid,
      testattributekey,
      testattributevalue,
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