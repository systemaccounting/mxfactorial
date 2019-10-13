const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
const microtime = require('microtime')
const { handler } = require('./index')

const {
  formatPendingNotifications,
  batchWriteTable,
  queryIndex,
  sendMessageToClient
} = require('./lib/awsServices')

const {
  accountsReceivingTransactionNotifications,
  transactionNotificationsToSend,
  dedupeTransactionNotificationRecipients,
  idAndTimestampNotifications
} = require('./supportedServices/transact')

const {
  dedupedRecipientList,
  pendingNotifications,
  pendingReceivedNotifications,
  snsEvent,
  notificationsToSend
} = require('./tests/utils/testData')

jest.mock('uuid/v1')
jest.mock('microtime')
jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation(() => {})
    },
    ApiGatewayManagementApi: jest.fn()
  }
})

jest.mock('./lib/awsServices', () => {
  return {
    formatPendingNotifications: jest.fn().mockImplementation(
      () => {
        return jest.requireActual('./tests/utils/testData')
          .pendingReceivedNotifications
      }
    ),
    batchWriteTable: jest.fn(),
    queryIndex: jest.fn().mockImplementation(
      () => {
        return jest.requireActual('./tests/utils/testData')
          .websocketConnectionIds
      }
    ),
    sendMessageToClient: jest.fn()
  }
})

jest.mock('./supportedServices/transact', () => {
  return {
    accountsReceivingTransactionNotifications: jest.fn().mockImplementation(
      () => {
        return jest.requireActual('./tests/utils/testData')
          .dedupedRecipientList
      }
    ),
    transactionNotificationsToSend: jest.fn().mockImplementation(() => {
      return jest.requireActual('./tests/utils/testData')
        .notificationsToSend
    }),
    idAndTimestampNotifications: jest.fn()
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.unmock('uuid/v1')
  jest.unmock('microtime')
  jest.unmock('aws-sdk')
  jest.unmock('./supportedServices/transact')
})

describe('lambda function', () => {
  test('calls accountsReceivingTransactionNotifications with args', async () => {
    await handler(snsEvent)
    expect(accountsReceivingTransactionNotifications)
      .toHaveBeenCalledWith(
        pendingNotifications,
        dedupeTransactionNotificationRecipients,
        'creditor',
        'debitor'
      )
  })

  test('calls transactionNotificationsToSend with args', async () => {
    await handler(snsEvent)
    expect(transactionNotificationsToSend)
    .toHaveBeenCalledWith(
      uuid,
      microtime,
      dedupedRecipientList,
      pendingNotifications,
      idAndTimestampNotifications
    )
  })

  test('calls formatPendingNotifications with args', async () => {
    await handler(snsEvent)
    expect(formatPendingNotifications)
      .toHaveBeenCalledWith(notificationsToSend)
  })

  test('calls formatPendingNotifications 3 times', async () => {
    await handler(snsEvent)
    expect(formatPendingNotifications)
      .toHaveBeenCalledTimes(3)
  })

  test('calls batchWriteTable with args', async () => {
    process.env.NOTIFICATIONS_TABLE_NAME = 'notifications-table'
    await handler(snsEvent)
    expect(batchWriteTable.mock.calls[0][0])
      .toEqual({})
    expect(batchWriteTable.mock.calls[0][1])
      .toBe('notifications-table')
    expect(batchWriteTable.mock.calls[0][2])
      .toBe(pendingReceivedNotifications)
  })

  test('calls queryIndex with args', async () => {
    process.env.WEBSOCKETS_TABLE_NAME = 'websocket-table'
    await handler(snsEvent)
    expect(queryIndex.mock.calls[0][0])
      .toEqual({})
    expect(queryIndex.mock.calls[0][1])
      .toBe('websocket-table')
    expect(queryIndex.mock.calls[0][2])
      .toBe('account-index')
    expect(queryIndex.mock.calls[0][3])
      .toBe('account')
    expect(queryIndex.mock.calls[0][4])
      .toBe(dedupedRecipientList[0])
  })

  test('calls sendMessageToClient 0 times', async () => {
    queryIndex.mockImplementation(() => [])
    await handler(snsEvent)
    await expect(sendMessageToClient).toHaveBeenCalledTimes(0)
  })

  test('calls sendMessageToClient for each connection id', async () => {
    queryIndex.mockImplementation(() => {
      return [
        ...jest.requireActual('./tests/utils/testData').websocketConnectionIds,
        ...jest.requireActual('./tests/utils/testData').websocketConnectionIds
      ]
    })
    await handler(snsEvent)
    await expect(sendMessageToClient).toHaveBeenCalledTimes(6)
  })
})