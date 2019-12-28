const {
  applyRules,
  getRules,
  queryTable
} = require('./applyRules')

const {
  itemsUnderTestArray,
  itemsStandardArray,
  testRuleInstances
} = require('../tests/utils/testData')

describe('applyRules', () => {
  test('rules applied to transactions', () => {
    let ruleIdParam = 'ruleId'
    let itemsParam = 'items'
    let result = applyRules(
      itemsUnderTestArray,
      testRuleInstances,
      ruleIdParam,
      itemsParam
    )
    expect(result).toEqual(itemsStandardArray)
  })

  test('getRules returns list of rules', async () => {
    let expected = [
      'rule1', 'rule2', 'rule3'
    ]
    let testRulesToQuery = [
      'testSchema1', 'testSchema2', 'testSchema3'
    ]
    let testQueryFunc = jest.fn()
      .mockImplementationOnce(
        () => {
          return [expected[0]]
        }
      )
      .mockImplementationOnce(
        () => {
          return [expected[1]]
        }
      )
      .mockImplementationOnce(
        () => {
          return [expected[2]]
        }
      )
    let testService = {}
    let testTable = 'testtable'
    let testRangeKey = 'testrangekey'
    let result = await getRules(
      testRulesToQuery,
      testQueryFunc,
      testService,
      testTable,
      testRangeKey,
    )
    expect(result).toEqual(expected)
  })

  test('calls getRules 3 times', async () => {
    let expected = [
      'rule1', 'rule2', 'rule3'
    ]
    let testRulesToQuery = [
      'testSchema1', 'testSchema2', 'testSchema3'
    ]
    let testQueryFunc = jest.fn()
      .mockImplementationOnce(
        () => {
          return [expected[0]]
        }
      )
      .mockImplementationOnce(
        () => {
          return [expected[1]]
        }
      )
      .mockImplementationOnce(
        () => {
          return [expected[2]]
        }
      )
    let testService = {}
    let testTable = 'testtable'
    let testRangeKey = 'testrangekey'
    await getRules(
      testRulesToQuery,
      testQueryFunc,
      testService,
      testTable,
      testRangeKey,
    )
    expect(testQueryFunc).toBeCalledTimes(3)
  })

  test('calls queryTables with params', async () => {
    let ddb = {
      query: jest.fn().mockImplementation(() => {
        return {
          promise: jest.fn().mockImplementation(() => {
            return {
              then: jest.fn().mockResolvedValue({ Items: [] })
            }
          })
        }
      })
    }
    let testTable = 'testtable'
    let testRangeKey = 'testrangekey'
    let testRangeValue = 'testrangevalue'
    let expected = {
      TableName: testTable,
      KeyConditionExpression: testRangeKey + ' = :a',
      ExpressionAttributeValues: {
        ':a': testRangeValue
      }
    }
    queryTable(
      ddb,
      testTable,
      testRangeKey,
      testRangeValue
    )
    expect(ddb.query).toHaveBeenCalledWith(expected)
  })
})