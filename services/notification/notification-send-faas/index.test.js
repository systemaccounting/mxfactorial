const { handler } = require('./index')

const {
  idAndTimestampNotifications,
  formatPendingNotifications,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
} = require('./lib/awsServices')

const {
  dedupeAccounts
} = require('./lib/utils')

const {
  pendingNotifications
} = require('./tests/utils/testData')

jest.mock('./lib/awsServices', () => {
  return {
    idAndTimestampNotifications: jest.fn().mockImplementation(
      () => jest.requireActual('./lib/utils').idAndTimestampNotifications
    ),
    formatPendingNotifications: jest.fn(),
    batchWriteTable: jest.fn(),
    queryIndex: jest.fn().mockImplementation(
      () => jest.requireActual('./tests/utils/testData').websocketConnectionIds
    ),
    sendMessageToClient: jest.fn()
  }
})

jest.mock('./lib/utils', () => {
  return {
    dedupeAccounts: jest.fn().mockImplementation(
      jest.requireActual('./lib/utils').dedupeAccounts
    )
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.unmock('./lib/awsServices')
  jest.unmock('./lib/utils')
})

const event = {
  Records: [
    {
      Sns: {
        Message: JSON.stringify(pendingNotifications)
      }
    }
  ]
}

describe('lambda function', () => {
  test('calls dedupeAccounts', async () => {
    await handler(event)
    await expect(dedupeAccounts).toHaveBeenCalled()
  })

  test('calls idAndTimestampNotifications', async () => {
    await handler(event)
    await expect(idAndTimestampNotifications).toHaveBeenCalledTimes(4)
  })

  test('calls formatPendingNotifications', async () => {
    await handler(event)
    await expect(formatPendingNotifications).toHaveBeenCalledTimes(4)
  })

  test('calls batchWriteTable', async () => {
    await handler(event)
    await expect(batchWriteTable).toHaveBeenCalledTimes(4)
  })

  test('calls queryIndex', async () => {
    await handler(event)
    await expect(queryIndex).toHaveBeenCalledTimes(4)
  })

  test('calls sendMessageToClient', async () => {
    await handler(event)
    await expect(sendMessageToClient).toHaveBeenCalledTimes(4)
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
    await expect(sendMessageToClient).toHaveBeenCalledTimes(8)
  })
})