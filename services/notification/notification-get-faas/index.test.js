const { handler } = require('./index')

const {
  queryIndex,
  queryTable,
  sendMessageToClient
} = require('./lib/awsServices')

jest.mock('./lib/awsServices', () => {
  return {
    queryTable: jest.fn().mockImplementation(
      () => [{ account: 'testaccount' }]
    ),
    queryIndex: jest.fn(),
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
    connection_id: '123456789'
  }
}

describe('lambda function', () => {
  test('calls queryTable', async () => {
    await handler(event)
    await expect(queryIndex).toHaveBeenCalled()
  })

  test('queryIndex', async () => {
    await handler(event)
    await expect(queryIndex).toHaveBeenCalled()
  })

  test('calls sendMessageToClient', async () => {
    await handler(event)
    await expect(sendMessageToClient).toHaveBeenCalled()
  })
})