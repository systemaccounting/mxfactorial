const {
  putItem,
  queryTable,
  deleteConnection
} = require('./awsServices')

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

  test('putItem params', () => {
    let ddb = mockAws('put')
    let table = 'testtable'
    let time = Date.now()
    let connectionId = 'testconnection'
    let account = 'testaccount'
    let expected = {
      TableName: table,
      Item: {
        connection_id: connectionId,
        timestamp: time,
        account
      }
    }
    putItem(ddb, table, time, connectionId, account)
    expect(ddb.put).toHaveBeenCalledWith(expected)
  })

  test('queryTable params', () => {
    let ddb = mockAws('query')
    let table = 'testtable'
    let key = 'connection_id'
    let val = '123456789'
    let expected = {
      TableName: table,
      KeyConditions: {
        [key]: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ val ]
        }
      }
    }
    queryTable(ddb, table, key, val)
    expect(ddb.query).toHaveBeenCalledWith(expected)
  })

  test('deleteConnection params', () => {
    let ddb = mockAws('delete')
    let table = 'testtable'
    let primaryKey = 'connection_id'
    let sortKey = 'timestamp'
    let connection = {
      connection_id: '123456789',
      timestamp: Date.now()
    }
    let expected = {
      TableName: table,
      Key: {
        [primaryKey]: connection.connection_id,
        [sortKey]: connection.timestamp
      }
    }
    deleteConnection(ddb, table, primaryKey, sortKey, connection)
    expect(ddb.delete).toHaveBeenCalledWith(expected)
  })

})