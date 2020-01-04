const AWS = require('aws-sdk')
const { handler } = require('./index')
const {
  applyRules,
  getRules
} = require('./src/applyRules')
const compareRequests = require('./src/compareRequests')
const storeRequests = require('./src/storeRequests')
const sendNotification = require('./src/sendNotification')

const {
  fakerAccountWithSevenRandomDigits,
  createRequestData,
  testRuleInstances,
} = require('./tests/utils/testData')

const STATUS_FAILED = 'failed'

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)

afterEach(() => {
  jest.clearAllMocks()
})

jest.mock('uuid/v1', () => jest.fn().mockReturnValue('662bc1a0-ed24-11e9-90ac-fd8810fc35b7'))
jest.mock('aws-sdk', () => ({
  SNS: jest.fn(() => ({})),
  DynamoDB: {
    DocumentClient: jest.fn(() => ({}))
  }
}))
jest.mock('./src/applyRules', () => {
  return {
    applyRules: jest.fn(
      () => ([{},{ rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d' }])
    ),
    getRules: jest.fn().mockImplementation(
      () => jest.requireActual('./tests/utils/testData')
      .testRuleInstances
    ),
    queryTable: {}
  }
})
jest.mock('./src/compareRequests', () => {
    return jest.fn()
      .mockImplementationOnce(() => false)
      .mockImplementation(() => true)
  }
)
jest.mock('./src/storeRequests', () => jest.fn(() => ({})))
jest.mock('./src/sendNotification')

describe('transact function handler', () => {
  // test position avoids multiple mockImplementationOnce for compareRequests
  it('"required items missing" returned from rule test failure', async () => {
    let result = await handler({
      items: debitRequest,
      graphqlRequestSender: TEST_CREDITOR
    })
    expect(result.message).toBe('required items missing')
  })

  it('returns "missing graphqlRequestSender" error', async () => {
    let result = await handler({
      items: debitRequest,
    })
    expect(result.message).toBe('missing graphqlRequestSender')
  })

  test('returns failed status from empty event', async () => {
    let emptyEvent = {}
    let response = await handler(emptyEvent)
    await expect(response.status).toBe(STATUS_FAILED)
  })

  test('storeRequests NOT called from empty event', async () => {
    let emptyEvent = {}
    await handler(emptyEvent)
    expect(storeRequests).not.toHaveBeenCalled()
  })

  it('calls getRules with args', async () => {
    let testRulesToQuery = ["name:"]
    let testQueryFunc = {}
    let testService = {}
    let testTable = 'testtable'
    process.env.RULE_INSTANCES_TABLE_NAME = testTable
    let testRangeKey = 'key_schema'
    await handler({
      items: debitRequest,
      graphqlRequestSender: TEST_CREDITOR
    })
    expect(getRules.mock.calls[0][0]).toEqual(testRulesToQuery)
    expect(getRules.mock.calls[0][1]).toEqual(testQueryFunc)
    // https://github.com/facebook/jest/issues/2982
    // expect(getRules[0][2]).toBe(testService)
    expect(getRules.mock.calls[0][3]).toBe(testTable)
    expect(getRules.mock.calls[0][4]).toBe(testRangeKey)
  })

  it('calls applyRules with args', async () => {
    let ruleIdParam = 'ruleId'
    let itemsParam = 'items'
    await handler({
      items: debitRequest,
      graphqlRequestSender: TEST_CREDITOR
    })
    expect(applyRules).toHaveBeenCalledWith(
      debitRequest,
      testRuleInstances,
      ruleIdParam,
      itemsParam
    )
  })

  it('calls compareRequests with requests', async () => {
    await handler({
      items: debitRequest,
      graphqlRequestSender: TEST_CREDITOR
    })
    expect(compareRequests).toHaveBeenCalledWith(
      debitRequest,
      [{}, { rule_instance_id: debitRequest[1].rule_instance_id }] // same as mock applyRules above
    )
  })

  it('ignores debitor_approval_time and creditor_approval_time sent from client', async () => {
    await handler({
      items: debitRequest,
      graphqlRequestSender: TEST_CREDITOR
    })

    expect(storeRequests.mock.calls[0][0][0].debitor_approval_time).toBeFalsy()
    expect(storeRequests.mock.calls[0][0][1].creditor_approval_time).toBeFalsy()
  })

  it('sendNotification called with args', async () => {
    process.env.NOTIFY_TOPIC_ARN = 'testarn'
    let testService = {}
    await handler({
      items: debitRequest,
      graphqlRequestSender: TEST_CREDITOR
    })
    const expected = {
      service: 'TRANSACT',
      message: {}
    }
    expect(sendNotification.mock.calls[0][0]).toEqual(testService)
    expect(sendNotification.mock.calls[0][1]).toBe('testarn')
    expect(sendNotification.mock.calls[0][2]).toEqual(expected)
  })
})