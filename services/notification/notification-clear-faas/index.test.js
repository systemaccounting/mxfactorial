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
  batchWriteTable
} = require('./lib/dynamodb')

const {
  sendMessageToClient
} = require('./lib/apiGateway')

const {
  tableModel
} = require('./lib/postgres')

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

jest.mock('./lib/postgres', () => {
  const findOne = jest.fn()
    .mockImplementationOnce(() => {})
    .mockImplementationOnce(
      () => ({ account: 'testaccount' })
    )
    .mockImplementation(
      () => ({})
    )
  const findAll = jest.fn().mockImplementation(() => ([]))
  const update = jest.fn()
  const destroy = jest.fn()
  const tableModel = jest.fn(() => ({ findOne, update, destroy, findAll }))
  const connection = {}
  return { tableModel, connection }
})

jest.mock('sequelize', () => ({}))

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
  test('throws 0 stored connections', async () => {
    await expect(handler(event)).rejects.toThrow('0 stored connections')
  })

  test('update NOT called IF account attribute present in websocket record', async () => {
    await handler(event)
    await expect(tableModel.mock.results[0].value.update)
      .toHaveBeenCalledTimes(0)
  })

  test('calls update with args IF account absent from postgres', async () => {
    const expectedAccount = { account: 'testaccount' }
    const expectedConnection = {
      where: {
        connection_id: event.requestContext.connectionId
      }
    }
    await handler(event)
    await expect(tableModel.mock.results[0].value.update)
      .toHaveBeenCalledWith(expectedAccount, expectedConnection)
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

  test('calls DocumentClient with config', async () => {
    let expected = {
      region: process.env.AWS_REGION
    }
    await handler(event)
    await expect(AWS.DynamoDB.DocumentClient)
      .toHaveBeenCalledWith(expected)
    AWS.DynamoDB.DocumentClient.mockClear()
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

  test('calls tableModel with service, dependency and table name', async () => {
    await handler(event)
    await expect(tableModel).toHaveBeenCalledWith({}, {}, 'notification_websockets')
    jest.clearAllMocks()
  })

  test('calls findOne with connection id', async () => {
    const expected = {
      where: {
        connection_id: event.requestContext.connectionId
      }
    }
    await handler(event)
    await expect(tableModel.mock.results[0].value.findOne)
      .toHaveBeenCalledWith(expected)
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

  test('calls findAll with args', async () => {
    const expected = {
      where: { account: 'testaccount' }
    }
    await handler(event)
    await expect(tableModel.mock.results[0].value.findAll)
      .toHaveBeenCalledWith(expected)
  })

  test('calls sendMessageToClient 0 times', async () => {
    await handler(event)
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
    await handler(event)
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
    await handler(event)
    await expect(sendMessageToClient).toHaveBeenCalledTimes(4)
  })
})