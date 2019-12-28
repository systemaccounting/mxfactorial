const { handler } = require('./index')
const {
  applyRules,
  getRules
} = require('./src/applyRules')

const {
  itemsUnderTestArray,
  itemsStandardArray,
  testRuleInstances
} = require('./tests/utils/testData')


afterEach(() => {
  jest.clearAllMocks()
})

jest.mock('./src/applyRules', () => {
  return {
    applyRules: jest.fn().mockImplementation(
      () => jest.requireActual('./tests/utils/testData')
      .itemsStandardArray
    ),
    getRules: jest.fn().mockImplementation(
      () => jest.requireActual('./tests/utils/testData')
      .testRuleInstances
    ),
    queryTable: {}
  }
})

describe('rules function handler', () => {

  it('calls getRules with args', async () => {
    let testRulesToQuery = ["name:"]
    let testQueryFunc = {}
    let testService = {}
    let testTable = 'testtable'
    process.env.RULE_INSTANCES_TABLE_NAME = testTable
    let testRangeKey = 'key_schema'
    await handler({ transactions: itemsUnderTestArray })
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
    await handler({ items: itemsStandardArray })
    expect(applyRules).toHaveBeenCalledWith(
      itemsStandardArray,
      testRuleInstances,
      ruleIdParam,
      itemsParam
    )
  })

  it('returns rule-modified transactions', async () => {
    let result = await handler({ items: itemsUnderTestArray })
    expect(result).toEqual(itemsStandardArray)
  })
})