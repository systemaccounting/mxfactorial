const {
  updateItem,
  formatNotificationsToClear,
  batchWriteTable,
  queryIndex
} = require('./dynamodb')

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

describe('dynamodb', () => {
  test('updateItem params', () => {
    let ddb = mockAws('update')
    let testtable = 'testtable'
    let testpartitionKey = 'testpartitionkey'
    let testsortkey = 'testsortkey'
    let testconnectionid = 'testconnectionid'
    let testtimestamp = 'testtimestamp'
    let testattributekey = 'testattributekey'
    let testattributevalue = 'testattributevalue'
    let testupdateconditionexpression = 'testupdateconditionexpression'
    let expected = {
      TableName: testtable,
      Key: {
        [testpartitionKey]: testconnectionid,
        [testsortkey]: testtimestamp
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
    let result = updateItem(
      ddb,
      testtable,
      testpartitionKey,
      testsortkey,
      testconnectionid,
      testtimestamp,
      testattributekey,
      testattributevalue,
      testupdateconditionexpression
    )
    expect(ddb.update).toHaveBeenCalledWith(expected)
  })

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
})