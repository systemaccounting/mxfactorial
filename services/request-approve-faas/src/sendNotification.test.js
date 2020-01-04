const sendNotification = require('./sendNotification')
const {
  fakerAccountWithSevenRandomDigits,
  createRequestData
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

const publish = jest.fn().mockImplementation(() => {
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

const sns = { publish }

describe('sendNotifcation', () => {
  test('params', async () => {
    let arn = 'arn'
    let expected = {
      Message: JSON.stringify(debitRequest),
      TopicArn: arn
    }
    await sendNotification(sns, arn, debitRequest)
    expect(publish).toHaveBeenCalledWith(expected)
  })
})