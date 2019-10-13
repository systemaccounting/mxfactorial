const sendNotification = require('./sendNotification')
const {
  itemsUnderTestArray
} = require('../tests/utils/testData')

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
      Message: JSON.stringify(itemsUnderTestArray),
      TopicArn: arn
    }
    await sendNotification(sns, arn, itemsUnderTestArray)
    expect(publish).toHaveBeenCalledWith(expected)
  })
})