const { handler } = require('./index')

const AWS = require('aws-sdk')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')

const AWS_REGION = process.env.AWS_REGION
const POOL_ID_NAME = process.env.POOL_ID_NAME

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

const authorize = require('./lib/iam')

const {
  TEST_TOKEN,
  TEST_POOL_LIST,
  TEST_KEYS,
  TEST_PUBLIC_PEM,
  TEST_TOKEN_PAYLOAD
} = require('./tests/utils/testConstants')

jest.mock('aws-sdk', () => {
  return {
    CognitoIdentityServiceProvider: jest.fn().mockImplementation(() => {})
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

jest.mock('./lib/iam')

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.unmock('aws-sdk')
  jest.unmock('axios')
  jest.unmock('jwk-to-pem')
  jest.unmock('./lib/cognito')
  jest.unmock('./lib/jwt')
  jest.unmock('./lib/iam')
})


let event = {
  headers: {
    Authorization: TEST_TOKEN
  },
  methodArn: 'testarn'
}

describe('lambda function', () => {
  test('throws unauthorized error on missing Authorization header', async () => {
    let missingAuthEvent = {
      headers: {
        // Authorization: TEST_TOKEN
      },
      methodArn: 'testarn'
    }
    await expect(handler(missingAuthEvent
      // https://github.com/facebook/jest/issues/1377#issuecomment-473922360
    )).rejects.toThrow('unauthorized')
  })

  test('throws malformed token error', async () => {
    let malformedTokenEvent = {
      headers: {
        Authorization: 'malformedtoken'
      },
      methodArn: 'testarn'
    }
    await expect(handler(malformedTokenEvent)).rejects.toThrow('malformed token')
  })

    test('calls CognitoIdentityServiceProvider with config', async () => {
      let expected = {
        apiVersion: '2016-04-18',
        region: AWS_REGION
      }
      await handler(event)
      await expect(AWS.CognitoIdentityServiceProvider)
        .toHaveBeenCalledWith(expected)
    })

  test('calls getPools with 1 argument', async () => {
    await handler(event)
    await expect(getPools.mock.calls[0].length).toBe(1)
  })

  test('calls getPools with object', async () => {
    await handler(event)
    await expect(getPools).toHaveBeenCalledWith({})
  })

  test('calls filterCurrentCognitoPoolId with pools and id name', async () => {
    await handler(event)
    await expect(filterCurrentCognitoPoolId)
      .toHaveBeenCalledWith(TEST_POOL_LIST, POOL_ID_NAME)
  })

  test('calls getCognitoJsonWebKeys with service, region and key id', async () => {
    await handler(event)
    await expect(getCognitoJsonWebKeys).toHaveBeenCalledWith(
      axios, AWS_REGION, TEST_POOL_LIST[1].id
    )
  })

  test('calls getClaimedKeyId called with token', async () => {
    await handler(event)
    await expect(getClaimedKeyId)
      .toHaveBeenCalledWith(event.headers.Authorization)
  })

  test('calls matchCognitoWebKey with keys and claimed key id', async () => {
    await handler(event)
    await expect(matchCognitoWebKey)
      .toHaveBeenCalledWith(TEST_KEYS, TEST_KEYS[0].kid)
  })

  test('calls pem with jwk-to-pem and test key', async () => {
    await handler(event)
    await expect(pem).toHaveBeenCalledWith(jwkToPem, TEST_KEYS[0])
  })

  test('calls verifyToken with service, token, pem and cognito key', async () => {
    await handler(event)
    await expect(verifyToken).toHaveBeenCalledWith(
      jwt, TEST_TOKEN, TEST_PUBLIC_PEM, TEST_KEYS[0]
    )
  })

  test('calls authorize with arn and account', async () => {
    await handler(event)
    await expect(authorize)
      .toHaveBeenCalledWith(event.methodArn, TEST_TOKEN_PAYLOAD['cognito:username'])
  })
})