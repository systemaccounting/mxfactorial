const {
  putItem,
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
    let primaryKey = 'connection_id'
    let primaryKeyValue = 'testconnection'
    let attributeKey = 'created_at'
    let attributeKeyValue = 1573440182072
    let expected = {
      TableName: table,
      Item: {
        [primaryKey]: primaryKeyValue,
        [attributeKey]: attributeKeyValue
      }
    }
    putItem(ddb, table, primaryKey, primaryKeyValue, attributeKey, attributeKeyValue)
    expect(ddb.put).toHaveBeenCalledWith(expected)
  })

  test('deleteConnection params', () => {
    let ddb = mockAws('delete')
    let table = 'testtable'
    let primaryKey = 'connection_id'
    let primaryKeyValue = 'testconnection'
    let expected = {
      TableName: table,
      Key: {
        [primaryKey]: primaryKeyValue,
      }
    }
    deleteConnection(ddb, table, primaryKey, primaryKeyValue)
    expect(ddb.delete).toHaveBeenCalledWith(expected)
  })

})