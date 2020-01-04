const {
  getRules,
  queryTable,
  GetRuleTransactionsResolver,
  GetRuleInstanceResolver
} = require('./Rule')

const {
  itemsUnderTestArray
} = require('../../../tests/utils/testData')

const testlambdaarn = 'testlambdaarn'
process.env.RULES_FAAS_ARN = testlambdaarn
const testtablename = 'testtablename'
process.env.RULE_INSTANCES_TABLE_NAME = testtablename

beforeEach(() => {
  jest.clearAllMocks()
})

describe('rule resolvers', () => {
  const mockLambdaService = {
    invoke: jest.fn(
      () => ({
        promise: jest.fn(
          () => ({
            then: () => ({
              catch: () => {}
            })
          })
        )
      })
    )
  }

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

  it('GetRuleTransactionsResolver service called with args', () => {
    const testargs = { transactions: itemsUnderTestArray }
    const expected = {
      FunctionName: testlambdaarn,
      Payload: JSON.stringify({ items: itemsUnderTestArray })
    }
    GetRuleTransactionsResolver(
      mockLambdaService,
      testargs
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it(
    'GetRuleTransactionsResolver returns "please specify at least 1 transaction"',
     async () => {
      const testargs = {}
      const result = await GetRuleTransactionsResolver(
        mockLambdaService,
        testargs
      )
      expect(result).toBe('please specify at least 1 transaction')
  })

  it(
    'GetRuleTransactionsResolver returns Payload object',
     async () => {
      const expected = { test: 'payload' }
      const payload = { Payload: JSON.stringify(expected) }
      const mockLambdaWithReturn = {
        invoke: jest.fn(
          () => ({
            promise: jest.fn(
              () => payload
            )
          })
        )
      }
      const testargs = { transactions: itemsUnderTestArray }
      const result = await GetRuleTransactionsResolver(
        mockLambdaWithReturn,
        testargs
      )
      expect(result).toEqual(expected)
  })

  it('GetRuleInstanceResolver calls getRulesFn with args', () => {
    const testservice = {}
    const testargs = [ 'name:' ] // rules list
    const mockGetRulesFn = jest.fn()
    const testquerytablefn = () => {}
    GetRuleInstanceResolver(
      testservice,
      testargs,
      mockGetRulesFn,
      testquerytablefn
    )
    expect(mockGetRulesFn).toHaveBeenCalledWith(
      testargs,
      testquerytablefn,
      testservice,
      testtablename,
      'key_schema'
    )
  })
})