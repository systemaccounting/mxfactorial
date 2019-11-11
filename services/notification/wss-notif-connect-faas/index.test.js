const { handler } = require('./index')
const AWS = require('aws-sdk')

const {
  putItem,
  deleteConnection
} = require('./lib/awsServices')

// process.env.AWS_REGION
// process.env.WEBSOCKETS_TABLE_NAME

const WEBSOCKET_TABLE_PRIMARY_KEY = 'connection_id'
const WEBSOCKET_TABLE_CONNECTED_AT_ATTRIBUTE = 'created_at'
const CONNECTION_ID = '123456789'
const CONNECTED_AT = 1573440182072
const ACCOUNT = 'testaccount'

jest.mock('./lib/awsServices', () => {
  return {
    putItem: jest.fn(),
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

const createEvent = eventType => {
  return {
    requestContext: {
      connectionId: CONNECTION_ID,
      authorizer: {
        account: ACCOUNT
      },
      eventType: eventType,
      connectedAt: CONNECTED_AT
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
      WEBSOCKET_TABLE_PRIMARY_KEY,
      CONNECTION_ID,
      WEBSOCKET_TABLE_CONNECTED_AT_ATTRIBUTE,
      CONNECTED_AT
    )
  })

  test('calls deleteConnection', async () => {
    let event = createEvent('DISCONNECT')
    await handler(event)
    expect(deleteConnection).toHaveBeenCalledWith(
      { put: 'func' },
      process.env.WEBSOCKETS_TABLE_NAME,
      WEBSOCKET_TABLE_PRIMARY_KEY,
      CONNECTION_ID
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