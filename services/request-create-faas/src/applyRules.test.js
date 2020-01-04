const {
  applyRules,
  getRules,
  queryTable
} = require('./applyRules')

const {
  fakerAccountWithSevenRandomDigits,
  createRequestData,
  testRuleInstances
} = require('../tests/utils/testData')

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)


describe('applyRules', () => {
  test('rules applied to requests', () => {
    let ruleIdParam = 'ruleId'
    let itemsParam = 'items'
    // avoid testing unpredictable approval time
    let itemsWithoutApprovalTime = debitRequest.map(
      // https://stackoverflow.com/a/46839399
      ({ creditor_approval_time, ...rest }) => rest
    )
    let taxExcluded = [ debitRequest[0] ]
    let result = applyRules(
      taxExcluded,
      testRuleInstances,
      ruleIdParam,
      itemsParam
    )
    let resultWithOutCreditorApprovalTime = result.map(
      ({
        creditor_approval_time,
        ...rest
      }) => rest
    )
    expect(resultWithOutCreditorApprovalTime).toEqual(itemsWithoutApprovalTime)
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