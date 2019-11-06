const { handler } = require('./index')
const AWS = require('aws-sdk')

const {
  putItem,
  queryTable,
  deleteConnection
} = require('./lib/awsServices')

// process.env.AWS_REGION
// process.env.WEBSOCKETS_TABLE_NAME
const WEBSOCKET_TABLE_PRIMARY_KEY = 'connection_id'
const WEBSOCKET_TABLE_SORT_KEY = 'timestamp'
const TIMESTAMP = 1570334570969
const CONNECTION_ID = '123456789'
const ACCOUNT = 'testaccount'
const CONNECTION = [
  { connection_id: CONNECTION_ID, timestamp: TIMESTAMP, account: ACCOUNT }
]

jest.mock('./lib/awsServices', () => {
  return {
    putItem: jest.fn(),
    queryTable: jest.fn().mockResolvedValue(
      [{ connection_id: '123456789', timestamp: 1570334570969, account: 'testaccount' }]
    ),
    deleteConnection: jest.fn()
  }
})

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn()
      .mockImplementation(() => {
        return {
          put: 'func'
        }
      })
    }
  }
})

Date.now = jest.fn(() => TIMESTAMP)

const createEvent = eventType => {
  return {
    requestContext: {
      connectionId: CONNECTION_ID,
      authorizer: {
        account: ACCOUNT
      },
      eventType: eventType
    }
  }
}

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.unmock('aws-sdk')
  jest.unmock('./lib/awsServices')
})

describe('lambda handerl', () => {

  test('calls DocumentClient with config', async () => {
    let event = createEvent('CONNECT')
    let expected = {
      region: process.env.AWS_REGION
    }
    await handler(event)
    await expect(AWS.DynamoDB.DocumentClient)
      .toHaveBeenCalledWith(expected)
  })

  test('calls putItem', async () => {
    let event = createEvent('CONNECT')
    await handler(event)
    expect(putItem).toHaveBeenCalledWith(
      { put: 'func' },
      process.env.WEBSOCKETS_TABLE_NAME,
      TIMESTAMP,
      CONNECTION_ID
    )
  })

  test('calls queryTable', async () => {
    let event = createEvent('DISCONNECT')
    await handler(event)
    expect(queryTable).toHaveBeenCalledWith(
      { put: 'func' },
      process.env.WEBSOCKETS_TABLE_NAME,
      WEBSOCKET_TABLE_PRIMARY_KEY,
      CONNECTION_ID
    )
  })

  test('calls deleteConnection', async () => {
    let event = createEvent('DISCONNECT')
    await handler(event)
    expect(deleteConnection).toHaveBeenCalledWith(
      { put: 'func' },
      process.env.WEBSOCKETS_TABLE_NAME,
      WEBSOCKET_TABLE_PRIMARY_KEY,
      WEBSOCKET_TABLE_SORT_KEY,
      CONNECTION[0] // let singleConnection = connectionValues[0]
    )
  })

  test('throws unmatched eventType error', async () => {
    let unmatchedEvent = createEvent('TESTTHROW')
    await expect(handler(unmatchedEvent))
      .rejects.toThrow('unmatched eventType')
  })

  test('returns 200 on CONNECT', async () => {
    let event = createEvent('CONNECT')
    let result = await handler(event)
    await expect(result).toEqual({ statusCode: 200 })
  })

  test('returns 200 on DISCONNECT', async () => {
    let event = createEvent('DISCONNECT')
    let result = await handler(event)
    await expect(result).toEqual({ statusCode: 200 })
  })
})