const { handler } = require('./index')

const {
  formatNotificationsToClear,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
} = require('./lib/awsServices')

const {
  notificationsToClear,
} = require('./tests/utils/testData')

jest.mock('./lib/awsServices', () => {
  return {
    formatNotificationsToClear: jest.fn(),
    batchWriteTable: jest.fn(),
    queryTable: jest.fn().mockImplementation(
      () => [{ account: 'testaccount' }]
    ),
    queryIndex: jest.fn().mockImplementation(() => {
      return jest.requireActual('./tests/utils/testData').websocketConnectionIds
    }),
    sendMessageToClient: jest.fn()
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.unmock('./lib/awsServices')
})

const event = {
  requestContext: {
    connection_id: '123456789',
    authorizer: {
      account: 'testaccount'
    }
  },
  body: JSON.stringify(notificationsToClear)
}

describe('lambda function', () => {
  test('calls queryIndex', async () => {
    await handler(event)
    await expect(queryIndex).toHaveBeenCalled()
  })

  test('calls formatNotificationsToClear with received notifications', async () => {
    let expected = notificationsToClear.notifications
    await handler(event)
    await expect(formatNotificationsToClear).toHaveBeenCalledWith(expected)
  })

  test('calls batchWriteTable', async () => {
    await handler(event)
    await expect(batchWriteTable).toHaveBeenCalled()
  })

  test('calls sendMessageToClient 0 times', async () => {
    queryIndex.mockImplementation(() => [])
    await handler(event)
    await expect(sendMessageToClient).toHaveBeenCalledTimes(0)
  })

  test('calls sendMessageToClient for each connection id', async () => {
    queryIndex.mockImplementation(() => {
      return [
        ...jest.requireActual('./tests/utils/testData').websocketConnectionIds,
        ...jest.requireActual('./tests/utils/testData').websocketConnectionIds
      ]
    })
    await handler(event)
    await expect(sendMessageToClient).toHaveBeenCalledTimes(2)
  })
})