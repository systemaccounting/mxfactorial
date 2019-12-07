const { handler } = require('./index')

const AWS = require('aws-sdk')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')

const {
  TEST_TOKEN,
  TEST_POOL_LIST,
  TEST_KEYS,
  TEST_PUBLIC_PEM,
} = require('./tests/utils/testConstants')

const {
  getPools,
  filterCurrentCognitoPoolId,
  getCognitoJsonWebKeys,
  matchCognitoWebKey
} = require('./lib/cognito')

const {
  getClaimedKeyId,
  pem,
  verifyToken
} = require('./lib/jwt')

const {
  formatNotificationsToClear,
  updateItem,
  queryIndex,
  queryTable,
  batchWriteTable
} = require('./lib/dynamodb')

const {
  sendMessageToClient
} = require('./lib/apiGateway')

const {
  batchWriteNotifications,
  clearNotificationsAction,
  clearNotificationsActionWithMissingToken,
  clearNotificationsActionWithMalformedToken
} = require('./tests/utils/testData')

jest.mock('aws-sdk', () => {
  return {
    CognitoIdentityServiceProvider: jest.fn().mockImplementation(() => {}),
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation(() => {})
    },
    ApiGatewayManagementApi: jest.fn().mockImplementation(() => {})
  }
})

jest.mock('axios', () => {
  return {
    get: jest.fn().mockResolvedValue(
      jest.requireActual('./tests/utils/testConstants').TEST_KEYS
    )
  }
})

jest.mock('jwk-to-pem')

jest.mock('./lib/cognito', () => {
  return {
    getPools: jest.fn().mockImplementation(() => {
      return jest.requireActual('./tests/utils/testConstants').TEST_POOL_LIST
    }),
    filterCurrentCognitoPoolId: jest.fn().mockResolvedValue(
      jest.requireActual('./tests/utils/testConstants').TEST_POOL_LIST[1].id
    ),
    getCognitoJsonWebKeys: jest.fn().mockResolvedValue(
      jest.requireActual('./tests/utils/testConstants').TEST_KEYS
    ),
    matchCognitoWebKey: jest.fn().mockImplementation(
      () => jest.requireActual('./tests/utils/testConstants').TEST_KEYS[0]
    )
  }
})

jest.mock('./lib/jwt', () => {
  return {
    getClaimedKeyId: jest.fn().mockImplementation(() => {
      return jest.requireActual('./tests/utils/testConstants').TEST_KEYS[0].kid
    }),
    pem: jest.fn().mockImplementation(() => {
      return jest.requireActual('./tests/utils/testConstants').TEST_PUBLIC_PEM
    }),
    verifyToken: jest.fn().mockResolvedValue(
      jest.requireActual('./tests/utils/testConstants').TEST_TOKEN_PAYLOAD
    )
  }
})

jest.mock('./lib/dynamodb', () => {
  return {
    updateItem: jest.fn(),
    queryTable: jest.fn().mockImplementationOnce(
      () => [{
        timestamp: 12345678910,
        account: 'testaccount' // first test
      }]
    ).mockImplementation(
      () => [{
        timestamp: 12345678910
      }]
    ),
    queryIndex: jest.fn().mockImplementation(() => {
      return jest.requireActual('./tests/utils/testData').pendingReceivedNotifications
    }),
    formatNotificationsToClear: jest.fn().mockImplementation(() => {
      return jest.requireActual('./tests/utils/testData').batchWriteNotifications
    }),
    batchWriteTable: jest.fn()
  }
})

jest.mock('./lib/apiGateway', () => {
  return {
    sendMessageToClient: jest.fn()
  }
})

afterEach(() => {
  // jest.clearAllMocks() // breaks aws service tests
})

afterAll(() => {
  jest.unmock('aws-sdk')
  jest.unmock('axios')
  jest.unmock('jwk-to-pem')
  jest.unmock('./lib/cognito')
  jest.unmock('./lib/jwt')
  jest.unmock('./lib/dynamodb')
  jest.unmock('./lib/apiGateway')
})


const event = {
  requestContext: {
    connectionId: '123456789'
  },
  body: clearNotificationsAction
}

describe('lambda function', () => {
  test('updateItem NOT called IF account attribute present in dynamodb record', async () => {
    await handler(event)
    await expect(updateItem).toHaveBeenCalledTimes(0)
  })

  test('calls CognitoIdentityServiceProvider with config', async () => {
    let expected = {
      region: process.env.AWS_REGION
    }
    await handler(event)
    await expect(AWS.CognitoIdentityServiceProvider)
      .toHaveBeenCalledWith(expected)
    AWS.CognitoIdentityServiceProvider.mockClear()
  })

  test('calls ApiGatewayManagementApi with config', async () => {
    let expected = {
      endpoint: process.env.WSS_CONNECTION_URL
    }
    await handler(event)
    await expect(AWS.ApiGatewayManagementApi)
      .toHaveBeenCalledWith(expected)
    AWS.ApiGatewayManagementApi.mockClear()
  })

  test('throws unauthorized error on missing Authorization header', async () => {
    let missingAuthEvent = {
      requestContext: {
        connection_id: '123456789'
      },
      body: clearNotificationsActionWithMissingToken
    }
    await expect(handler(missingAuthEvent
      // https://github.com/facebook/jest/issues/1377#issuecomment-473922360
    )).rejects.toThrow('unauthorized')
    jest.clearAllMocks()
  })

  test('throws malformed token error', async () => {
    let malformedTokenEvent = {
      requestContext: {
        connection_id: '123456789'
      },
      body: clearNotificationsActionWithMalformedToken
    }
    await expect(handler(malformedTokenEvent)).rejects.toThrow('malformed token')
    jest.clearAllMocks()
  })

  test('calls getPools with 1 argument', async () => {
    await handler(event)
    await expect(getPools.mock.calls[0].length).toBe(1)
    jest.clearAllMocks()
  })

  test('calls getPools with cognito service', async () => {
    await handler(event)
    await expect(getPools).toHaveBeenCalledWith({})
    jest.clearAllMocks()
  })

  test('calls filterCurrentCognitoPoolId with pools and id name', async () => {
    await handler(event)
    await expect(filterCurrentCognitoPoolId)
      .toHaveBeenCalledWith(TEST_POOL_LIST, process.env.POOL_NAME)
    jest.clearAllMocks()
  })

  test('calls getCognitoJsonWebKeys with service, region and key id', async () => {
    await handler(event)
    await expect(getCognitoJsonWebKeys).toHaveBeenCalledWith(
      axios, process.env.AWS_REGION, TEST_POOL_LIST[1].id
    )
    jest.clearAllMocks()
  })

  test('calls getClaimedKeyId called with token', async () => {
    let token = JSON.parse(event.body).token
    await handler(event)
    await expect(getClaimedKeyId)
      .toHaveBeenCalledWith(token)
    jest.clearAllMocks()
  })

  test('calls matchCognitoWebKey with keys and claimed key id', async () => {
    await handler(event)
    await expect(matchCognitoWebKey)
      .toHaveBeenCalledWith(TEST_KEYS, TEST_KEYS[0].kid)
    jest.clearAllMocks()
  })

  test('calls pem with jwk-to-pem and test key', async () => {
    await handler(event)
    await expect(pem).toHaveBeenCalledWith(jwkToPem, TEST_KEYS[0])
    jest.clearAllMocks()
  })

  test('calls verifyToken with service, token, pem and cognito key', async () => {
    await handler(event)
    await expect(verifyToken).toHaveBeenCalledWith(
      jwt, TEST_TOKEN, TEST_PUBLIC_PEM, TEST_KEYS[0]
    )
    jest.clearAllMocks()
  })

  test('calls queryTable with service, table name, partition key and connection id', async () => {
    await handler(event)
    await expect(queryTable).toHaveBeenCalledWith(
      {}, process.env.WEBSOCKETS_TABLE_NAME, 'connection_id', '123456789'
    )
    jest.clearAllMocks()
  })

  test('calls updateItem with args', async () => {
    let ddb = {}
    let partitiionKey = 'connection_id'
    let connectionId = '123456789'
    let indexAttribute = 'account'
    let account = 'testaccount'
    await handler(event)
    await expect(updateItem).toHaveBeenCalledWith(
      ddb,
      process.env.WEBSOCKETS_TABLE_NAME,
      partitiionKey,
      connectionId,
      indexAttribute,
      account,
    )
    jest.clearAllMocks()
  })

  test('calls formatNotificationsToClear with received notifications', async () => {
    let expected = JSON.parse(event.body).notifications
    await handler(event)
    await expect(formatNotificationsToClear).toHaveBeenCalledWith(expected)
    jest.clearAllMocks()
  })

  test('calls batchWriteTable', async () => {
    let ddb = {}
    let tableName = process.env.NOTIFICATIONS_TABLE_NAME
    let notificationsToDeleteFromTable = batchWriteNotifications
    await handler(event)
    await expect(batchWriteTable).toHaveBeenCalledWith(
      ddb,
      tableName,
      notificationsToDeleteFromTable
    )
    jest.clearAllMocks()
  })

  test('calls queryIndex with args', async () => {
    let ddb = {}
    let tableName = process.env.WEBSOCKETS_TABLE_NAME
    let indexName = 'account-index'
    let indexAttribute = 'account'
    let account = 'testaccount'
    await handler(event)
    await expect(queryIndex).toHaveBeenCalledWith(
      ddb,
      tableName,
      indexName,
      indexAttribute,
      account
    )
    jest.clearAllMocks()
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