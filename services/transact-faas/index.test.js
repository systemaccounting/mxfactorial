const { handler } = require('./index')
const {
  applyRules,
  getRules
} = require('./src/applyRules')
const compareTransactions = require('./src/compareTransactions')
const storeTransactions = require('./src/storeTransactions')
const sendNotification = require('./src/sendNotification')

const {
  itemsStandardArray,
  testRuleInstances,
  testedItemsIntendedForStorage,
  testNotification
} = require('./tests/utils/testData')

const STATUS_FAILED = 'failed'

afterEach(() => {
  jest.clearAllMocks()
})

jest.mock('uuid/v1', () => jest.fn().mockReturnValue('662bc1a0-ed24-11e9-90ac-fd8810fc35b7'))
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
jest.mock('./src/compareTransactions', () => {
    return jest.fn()
      .mockImplementationOnce(() => false)
      .mockImplementation(() => true)
  }
)
jest.mock('./src/storeTransactions', () => {
  return jest.fn().mockImplementation(
    () => jest.requireActual('./tests/utils/testData').itemsStandardArray
  )
})
jest.mock('./src/sendNotification')

describe('transact function handler', () => {
  // test position avoids multiple mockImplementationOnce for compareTransactions
  it('"Required items missing" returned from rule test failure', async () => {
    let result = await handler({ items: itemsStandardArray })
    expect(result.message).toBe('Required items missing')
  })

  test('returns failed status from empty event', async () => {
    let emptyEvent = {}
    let response = await handler(emptyEvent)
    await expect(response.status).toBe(STATUS_FAILED)
  })

  test('storeTransactions NOT called from empty event', async () => {
    let emptyEvent = {}
    await handler(emptyEvent)
    expect(storeTransactions).not.toHaveBeenCalled()
  })

  it('calls getRules with args', async () => {
    let testRulesToQuery = ["name:"]
    let testQueryFunc = {}
    let testService = {}
    let testTable = 'testtable'
    process.env.RULE_INSTANCES_TABLE_NAME = testTable
    let testRangeKey = 'key_schema'
    await handler({ items: itemsStandardArray })
    expect(getRules.mock.calls[0][0]).toEqual(testRulesToQuery)
    expect(getRules.mock.calls[0][1]).toEqual(testQueryFunc)
    // https://github.com/facebook/jest/issues/2982
    // expect(getRules[0][2]).toBe(testService)
    expect(getRules.mock.calls[0][3]).toBe(testTable)
    expect(getRules.mock.calls[0][4]).toBe(testRangeKey)
  })

  it('calls applyRules with args', async () => {
    let ruleIdParam = 'ruleId'
    let itemsParam = 'transactionItems'
    await handler({ items: itemsStandardArray })
    expect(applyRules).toHaveBeenCalledWith(
      itemsStandardArray,
      testRuleInstances,
      ruleIdParam,
      itemsParam
    )
  })

  it('calls compareTransactions with transactions', async () => {
    await handler({ items: itemsStandardArray })
    expect(compareTransactions).toHaveBeenCalledWith(
      itemsStandardArray,
      itemsStandardArray
    )
  })

  it('ignores debitor_approval_time and creditor_approval_time sent from client', async () => {
    await handler({ items: itemsStandardArray })
    let expected = itemsStandardArray.map(item => {
      let {
        debitor_approval_time,
        creditor_approval_time,
        ...allowedItems
      } = item
      allowedItems.transaction_id = testedItemsIntendedForStorage[0].transaction_id
      return allowedItems
    })
    expect(storeTransactions).toHaveBeenCalledWith(expected)
  })

  it('sendNotification called with args', async () => {
    process.env.NOTIFY_TOPIC_ARN = 'testarn'
    let testService = {}
    await handler({ items: itemsStandardArray })
    // expect(sendNotification.mock.calls[0][0]).toBe(testService)
    expect(sendNotification.mock.calls[0][1]).toBe('testarn')
    expect(sendNotification.mock.calls[0][2]).toEqual(testNotification)
  })
})