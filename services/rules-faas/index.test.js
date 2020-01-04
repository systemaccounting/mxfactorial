const AWS = require('aws-sdk')
const { handler } = require('./index')
const {
  applyRules,
  getRules
} = require('./src/applyRules')

const {
  fakerAccountWithSevenRandomDigits,
  createRequestData,
  testRuleInstances
} = require('./tests/utils/testData')

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)

const taxExcluded = [ debitRequest[0] ]

afterEach(() => {
  jest.clearAllMocks()
})

jest.mock('aws-sdk')

jest.mock('./src/applyRules', () => {
  return {
    applyRules: jest.fn(
      () => ({})
    ),
    getRules: jest.fn().mockImplementation(
      () => jest.requireActual('./tests/utils/testData')
      .testRuleInstances
    ),
    queryTable: {}
  }
})

describe('rules function handler', () => {

  test('calls DocumentClient with config', async () => {
    let expected = {
      region: process.env.AWS_REGION
    }
    await handler({ transactions: taxExcluded })
    await expect(AWS.DynamoDB.DocumentClient)
      .toHaveBeenCalledWith(expected)
    AWS.DynamoDB.DocumentClient.mockClear()
  })

  it('calls getRules with args', async () => {
    let testRulesToQuery = ["name:"]
    let testQueryFunc = {}
    let testService = {}
    let testTable = 'testtable'
    process.env.RULE_INSTANCES_TABLE_NAME = testTable
    let testRangeKey = 'key_schema'
    await handler({ transactions: taxExcluded })
    expect(getRules.mock.calls[0][0]).toEqual(testRulesToQuery)
    expect(getRules.mock.calls[0][1]).toEqual(testQueryFunc)
    // https://github.com/facebook/jest/issues/2982
    // expect(getRules.mock.calls[0][2]).toBe(testService)
    expect(getRules.mock.calls[0][3]).toBe(testTable)
    expect(getRules.mock.calls[0][4]).toBe(testRangeKey)
  })

  it('calls applyRules with args', async () => {
    let ruleIdParam = 'ruleId'
    let itemsParam = 'items'
    await handler({ items: debitRequest })
    expect(applyRules).toHaveBeenCalledWith(
      debitRequest,
      testRuleInstances,
      ruleIdParam,
      itemsParam
    )
  })

  it('returns rule-modified transactions', async () => {
    let result = await handler({ items: taxExcluded })
    expect(result).toEqual({})
  })
})