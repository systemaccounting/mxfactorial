const { handler } = require('./index')
const awsServerlessExpress = require('aws-serverless-express')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const axios = require('axios')

const {
  getClaimedKeyId,
  matchCognitoWebKey,
  pem,
  verifyToken
} = require('./src/jwt')

const appWrapper = require('./src/app')

const {
  TEST_TOKEN,
  TEST_KEYS,
  TEST_PUBLIC_PEM,
} = require('./tests/utils/testConstants')

jest.mock('./src/jwt', () => {
  return {
    getClaimedKeyId: jest.fn().mockImplementation(() => {
      return jest.requireActual('./tests/utils/testConstants').TEST_KEYS[0].kid
    }),
    pem: jest.fn().mockImplementation(() => {
      return jest.requireActual('./tests/utils/testConstants').TEST_PUBLIC_PEM
    }),
    verifyToken: jest.fn().mockResolvedValue(
      jest.requireActual('./tests/utils/testConstants').TEST_TOKEN_PAYLOAD
    ),
    matchCognitoWebKey: jest.fn().mockImplementation(
      () => jest.requireActual('./tests/utils/testConstants').TEST_KEYS[0]
    )
  }
})

jest.mock('./src/app', () => jest.fn(() => ({})))

const testjwksurl = 'testjwksurl'
process.env.JWKS_URL = testjwksurl

jest.mock('aws-serverless-express', () => ({
  proxy: jest.fn(
    () => ({ promise: 'testpromise' })
  ),
  createServer: jest.fn(() => ({}))
}))
jest.mock('jsonwebtoken')
jest.mock('jwk-to-pem')

jest.mock('axios', () => ({
  get: jest.fn().mockImplementation(
    () => ({
      data: {
        keys: jest.requireActual('./tests/utils/testConstants').TEST_KEYS
      }
    })
  )
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('lambda handler', () => {
  const event = {
    headers: {
      Authorization: TEST_TOKEN
    }
  }
  const context = {}

  it('calls axios get with arg', async () => {
    await handler(event, context)
    expect(axios.get).toHaveBeenCalledWith(testjwksurl)
  })

  it('throws and logs axios get errors', async () => {
    const spy = jest.spyOn(console, 'log')
    axios.get.mockRejectedValueOnce(new Error('testerror'))
    try {
      await handler(event, context)
    } catch (e) {
      await expect(spy.mock.calls[0][0].message).toBe('testerror')
    }
    spy.mockRestore()
  })

  it('calls getClaimedKeyId called with token', async () => {
    await handler(event)
    await expect(getClaimedKeyId)
      .toHaveBeenCalledWith(event.headers.Authorization)
  })

  it('calls matchCognitoWebKey with keys and claimed key id', async () => {
    await handler(event, context)
    await expect(matchCognitoWebKey)
      .toHaveBeenCalledWith(TEST_KEYS, TEST_KEYS[0].kid)
  })

  it('calls pem with jwk-to-pem and test key', async () => {
    await handler(event, context)
    await expect(pem).toHaveBeenCalledWith(jwkToPem, TEST_KEYS[0])
  })

  it('calls verifyToken with service, token, pem and cognito key', async () => {
    await handler(event, context)
    await expect(verifyToken).toHaveBeenCalledWith(
      jwt, TEST_TOKEN, TEST_PUBLIC_PEM, TEST_KEYS[0]
    )
  })

  it('throws and logs verifyToken errors', async () => {
    const spy = jest.spyOn(console, 'log')
    verifyToken.mockRejectedValueOnce(new Error('testerror'))
    try {
      await handler(event, context)
    } catch (e) {
      await expect(spy.mock.calls[0][0].message).toBe('testerror')
    }
    spy.mockRestore()
  })

  it('calls appWrapper with event and context', async () => {
    await handler(event, context)
    await expect(appWrapper).toHaveBeenCalledWith(event, context)
  })

  it('calls createServer with express app object', async () => {
    await handler(event, context)
    await expect(awsServerlessExpress.createServer).toHaveBeenCalledWith({})
  })

  it('calls proxy with args', async () => {
    await handler(event, context)
    await expect(awsServerlessExpress.proxy).toHaveBeenCalledWith(
      {},
      event,
      context,
      'PROMISE'
    )
  })

  it('returns serverless app', async () => {
    const result = await handler(event, context)
    await expect(result).toBe('testpromise')
  })
})