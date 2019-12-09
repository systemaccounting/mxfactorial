const { handler } = require('./index')

const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
const microtime = require('microtime')

const {
  formatPendingNotifications,
  batchWriteTable,
  sendMessageToClient
} = require('./lib/awsServices')

const {
  accountsReceivingTransactionNotifications,
  transactionNotificationsToSend,
  dedupeTransactionNotificationRecipients,
  idAndTimestampNotifications
} = require('./supportedServices/transact')

const {
  tableModel
} = require('./lib/postgres')

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

jest.mock('./lib/postgres', () => {
  const findAll = jest.fn()
      .mockImplementationOnce(() => (
        [
          ...jest.requireActual('./tests/utils/testData').websocketConnectionIds,
          ...jest.requireActual('./tests/utils/testData').websocketConnectionIds
        ]
      ))
      .mockImplementation(() => ([]))
  const tableModel = jest.fn(() => ({ findAll }))
  const connection = {}
  return { tableModel, connection }
})

jest.mock('sequelize', () => ({}))

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.unmock('uuid/v1')
  jest.unmock('microtime')
  jest.unmock('aws-sdk')
  jest.unmock('sequelize')
  jest.unmock('./supportedServices/transact')
  jest.unmock('./lib/postgres')
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

  test('calls tableModel with service, dependency and table name', async () => {
    await handler(snsEvent)
    await expect(tableModel).toHaveBeenCalledWith({}, {}, 'notification_websockets')
    jest.clearAllMocks()
  })

  test('calls findAll with args', async () => {
    await handler(snsEvent)
    await expect(tableModel.mock.results[0].value.findAll.mock.calls[0][0])
      .toEqual({ where: { account: 'testcreditor1' } })
    await expect(tableModel.mock.results[0].value.findAll.mock.calls[1][0])
      .toEqual({ where: { account: 'testcreditor2' } })
    await expect(tableModel.mock.results[0].value.findAll.mock.calls[2][0])
      .toEqual({ where: { account: 'testdebitor1' } })
  })

  test('calls sendMessageToClient 0 times', async () => {
    await handler(snsEvent)
    await expect(sendMessageToClient).toHaveBeenCalledTimes(0)
  })

  test('deletes websocket if expired', async () => {
    sendMessageToClient.mockImplementation(
      () => {
        throw new Error('410')
      }
    )
    const destroyMock = jest.fn()
    tableModel.mockImplementation(
      () => {
        return {
          findOne: jest.fn(() => ({})),
          update: jest.fn(),
          destroy: destroyMock,
          findAll: jest.fn().mockImplementation(() => {
            return [
              ...jest.requireActual('./tests/utils/testData').websocketConnectionIds,
              ...jest.requireActual('./tests/utils/testData').websocketConnectionIds
            ]
          })
        }
      }
    )
    await handler(snsEvent)
    await expect(destroyMock)
      .toHaveBeenCalledWith({
        where: {
          connection_id: '12345678910'
        }
      })
  })

  test('calls sendMessageToClient for each connection id', async () => {
    tableModel.mockImplementation(
      () => {
        return {
          findOne: () => ({}),
          update: () => ({}),
          findAll: () => (
            [
              ...jest.requireActual('./tests/utils/testData').websocketConnectionIds,
              ...jest.requireActual('./tests/utils/testData').websocketConnectionIds
            ]
          ),
          destroy: () => {}
        }
      }
    )
    await handler(snsEvent)
    await expect(sendMessageToClient).toHaveBeenCalledTimes(6)
  })
})