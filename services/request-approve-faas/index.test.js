const Sequelize = require('sequelize')
const AWS = require('aws-sdk')

const compareRequests = require('./src/compareRequests')
const updateRequest = require('./src/updateRequest')
const sendNotification = require('./src/sendNotification')
const getRequest = require('./src/getRequest')

jest.mock('sequelize', () => jest.fn())
jest.mock('aws-sdk')

const {
  itemsStandardArray,
  itemsUnderTestArray,
  debitorStandardArray,
  testRuleInstances,
  testedItemsIntendedForStorage,
  testNotification,
  TEST_ACCOUNTS
} = require('./tests/utils/testData')

const STATUS_FAILED = 'failed'

jest.mock('./src/compareRequests', () => {
    return jest.fn()
      .mockImplementationOnce(() => false)
      .mockImplementation(() => true)
  }
)

jest.mock('./src/updateRequest', () => {
  return jest.fn().mockImplementation(
    () => ([
      0, // mocking sequelize response
      jest.requireActual('./tests/utils/testData').itemsStandardArray
    ])
  )
})

jest.mock('./src/sendNotification')
jest.mock('./src/getRequest')

const testdb = 'testdb'
const testuser = 'testuser'
const testpwd = 'testpwd'
const testhost = 'testhost'
const testport = '5432' // $ VAR=5432 node -e 'console.log(typeof process.env.VAR)' // => string
const testregion = 'us-east-1'
const testtable = 'testtable'
const testsnsarn = 'testsnsarn'
process.env.PGUSER = testuser
process.env.PGPASSWORD = testpwd
process.env.PGHOST = testhost
process.env.PGPORT = testport
process.env.AWS_REGION = testregion
process.env.RULE_INSTANCES_TABLE_NAME = testtable
process.env.PGDATABASE = testdb
process.env.NOTIFY_TOPIC_ARN = testsnsarn

describe('transact function handler', () => {
  test('SNS called with args', async () => {
    const testapiversion = '2010-03-31'
    const testregion = 'us-east-1'
    process.env.AWS_REGION = testregion
    await require('./index').handler({})
    expect(AWS.SNS).toHaveBeenCalledWith(
      {
        apiVersion: testapiversion,
        region: testregion
      }
    )
  })

  test('Sequelize called with args', async () => {
    const expectedConfig = {
      host: testhost,
      operatorsAliases: 0,
      logging: console.log,
      port: testport,
      dialect: 'postgres',
      pool: {
        min: 0,
        max: 5,
        acquire: 30000,
        idle: 10000,
        handleDisconnects: 1
      }
    }
    require('./index')
    expect(Sequelize).toHaveBeenCalledWith(
      testdb,
      testuser,
      testpwd,
      expectedConfig
    )
  })

  test('empty items returns "specifiy at least 1 request" error message', async () => {
    const result = await require('./index').handler({})
    expect(result.message).toBe('please specify at least 1 request')
  })

  it('returns "missing graphqlRequestSender" error', async () => {
    const result = await require('./index').handler({
      items: itemsStandardArray,
    })
    expect(result.message).toBe('missing graphqlRequestSender')
  })

  test('return "mixed transaction ids detected" error message', async () => {
    const mixedTransactions = [
      ...itemsUnderTestArray,
      {
        name: 'Milk',
        price: '3',
        quantity: '2',
        author: TEST_ACCOUNTS[1],
        debitor: TEST_ACCOUNTS[0],
        creditor: TEST_ACCOUNTS[1],
        transaction_id: '2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d'
      }
    ]
    const result = await require('./index').handler({
      items: mixedTransactions,
      graphqlRequestSender: TEST_ACCOUNTS[1]
    })
    expect(result.message).toBe('mixed transaction ids detected')
  })

  test('return "unauthenticated account detected in items" error message', async () => {
    const result = await require('./index').handler({
      items: itemsStandardArray,
      graphqlRequestSender: 'accountNotIncludedInRequestedTransactions'
    })
    expect(result.message).toBe('unauthenticated account detected in items')
  })

  test('return "previously approved credit request item detected" error message', async () => {
    const result = await require('./index').handler({
      items: itemsStandardArray.map(
        item => ({ ...item, creditor_approval_time: '2019-12-31 03:30:11.108271+00' })
      ),
      graphqlRequestSender: TEST_ACCOUNTS[1]
    })
    expect(result.message).toBe('previously approved credit request item detected')
  })

  test('return "previously approved debit request item detected" error message', async () => {
    const result = await require('./index').handler({
      items: itemsStandardArray.map(
        item => ({ ...item, debitor_approval_time: '2019-12-31 03:30:11.108271+00' })
      ),
      graphqlRequestSender: TEST_ACCOUNTS[1]
    })
    expect(result.message).toBe('previously approved debit request item detected')
  })

  test('getRequest called with args', async () => {
    await require('./index').handler({
      items: itemsStandardArray,
      graphqlRequestSender: TEST_ACCOUNTS[1]
    })
    expect(getRequest).toHaveBeenCalledWith({}, itemsStandardArray[0].transaction_id)
  })

  test('return "0 matching requests found" error', async () => {
    compareRequests.mockReturnValue(false)
    const result = await require('./index').handler({
      items: itemsStandardArray,
      graphqlRequestSender: TEST_ACCOUNTS[1]
    })
    expect(result.message).toBe('0 matching requests found')
  })

  test('calls updateRequest with creditor_approval_time', async () => {
    compareRequests.mockReturnValue(true)
    await require('./index').handler({
      items: itemsStandardArray,
      graphqlRequestSender: TEST_ACCOUNTS[1]
    })
    expect(updateRequest).toHaveBeenCalledWith(
      {},
      itemsStandardArray[0].transaction_id,
      'creditor_approval_time'
    )
  })

  test('calls updateRequest with debitor_approval_time', async () => {
    compareRequests.mockReturnValue(true)
    await require('./index').handler({
      items: debitorStandardArray,
      graphqlRequestSender: TEST_ACCOUNTS[1]
    })
    expect(updateRequest).toHaveBeenCalledWith(
      {},
      debitorStandardArray[0].transaction_id,
      'debitor_approval_time'
    )
  })

  test('sendNotification called with args', async () => {
    let testService = {}
    await require('./index').handler({
      items: debitorStandardArray,
      graphqlRequestSender: TEST_ACCOUNTS[1]
    })
    // expect(sendNotification.mock.calls[0][0]).toBe(testService)
    expect(sendNotification.mock.calls[0][1]).toBe(testsnsarn)
    expect(sendNotification.mock.calls[0][2]).toEqual(testNotification)
  })

  test('returns approved transaction request', async () => {
    const result = await require('./index').handler({
      items: itemsStandardArray,
      graphqlRequestSender: TEST_ACCOUNTS[1]
    })
    // expect(sendNotification.mock.calls[0][0]).toBe(testService)
    expect(result.data).toEqual(itemsStandardArray)
  })
})