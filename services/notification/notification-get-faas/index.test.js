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
  queryIndex,
  setNotificationLimit,
  computeRequestedNotificationCount
} = require('./lib/dynamodb')

const {
  sendMessageToClient
} = require('./lib/apiGateway')

const {
  tableModel
} = require('./lib/postgres')

const {
  pendingReceivedNotifications,
  getNotificationsAction,
  getNotificationsActionWithMissingToken,
  getNotificationsActionWithMalformedToken
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

jest.mock('sequelize', () => ({}))

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
    queryIndex: jest.fn(
      () => jest.requireActual('./tests/utils/testData')
        .pendingReceivedNotifications),
    setNotificationLimit: () => {},
    computeRequestedNotificationCount: jest.fn(
      () => parseInt(process.env.NOTIFICATION_RETRIEVAL_LIMIT_COUNT)
    )
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
  const update = jest.fn()
  const tableModel = jest.fn(() => ({ findOne, update }))
  const connection = {}
  return { tableModel, connection }
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
  body: getNotificationsAction
}

describe('lambda function', () => {
  // sequence of first 3 tests relevant to avoid multiple
  // mockImplementationOnce from mock ./lib/postgres
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
      apiVersion: '2016-04-18',
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
      body: getNotificationsActionWithMissingToken
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
      body: getNotificationsActionWithMalformedToken
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

  test('calls computeRequestedNotificationCount with args', async () => {
    await handler(event)
    await expect(computeRequestedNotificationCount).toHaveBeenCalledWith(
      JSON.parse(getNotificationsAction),
      setNotificationLimit,
      parseInt(process.env.NOTIFICATION_RETRIEVAL_LIMIT_COUNT)
    )
    jest.clearAllMocks()
  })

  test('calls queryIndex with args', async () => {
    let ddb = {}
    let tableName = process.env.NOTIFICATIONS_TABLE_NAME
    let indexName = 'account-index'
    let recordReturnLimit = 20
    let indexAttribute = 'account'
    let account = 'testaccount'
    await handler(event)
    await expect(queryIndex).toHaveBeenCalledWith(
      ddb,
      tableName,
      indexName,
      recordReturnLimit,
      indexAttribute,
      account
    )
    jest.clearAllMocks()
  })

  test('calls sendMessageToClient', async () => {
    let ws = {}
    let connectionId = '123456789'
    let pending = {
      pending: pendingReceivedNotifications
    }
    await handler(event)
    await expect(sendMessageToClient).toHaveBeenCalledWith(
      ws,
      connectionId,
      pending
    )
    jest.clearAllMocks()
  })
})