const {
  getClaimedKeyId,
  matchCognitoWebKey,
  pem,
  verifyToken
} = require('./jwt')

const {
  TEST_TOKEN,
  TEST_KEYS,
  TEST_PUBLIC_PEM
} = require('../tests/utils/testConstants')

afterEach(() => {
  jest.clearAllMocks()
})

describe('json web token', () => {

  test('getClaimedKeyId', () => {
    const expected = '12345678901234567890123456789123456789123456='
    const result = getClaimedKeyId(TEST_TOKEN)
    expect(result).toBe(expected)
  })

  test('matchCognitoWebKey filters key with claimed key id', () => {
    const expected = TEST_KEYS[0]
    const CLAIMED_KEY_ID = TEST_KEYS[0].kid
    const result = matchCognitoWebKey(TEST_KEYS, CLAIMED_KEY_ID)
    expect(result).toEqual(expected)
  })

  test('matchCognitoWebKey throws 0 claimed cognito keys matched', () => {
    const CLAIMED_KEY_ID = '111'
    expect(() => matchCognitoWebKey(TEST_KEYS, CLAIMED_KEY_ID))
      .toThrow('0 claimed cognito keys matched')
  })

  test('pem', () => {
    const pemPackage = jest.fn()
    pem(pemPackage, TEST_KEYS[0])
    expect(pemPackage).toHaveBeenCalledWith(TEST_KEYS[0])
  })

  test('verifyToken params', async () => {
    let verify = jest.fn()
    let jwt = { verify }
    let expectedOpts = {
      algorithms: [TEST_KEYS[0].alg],
      issuer: TEST_KEYS[0].iss
    }
    let expected = [TEST_TOKEN, TEST_PUBLIC_PEM, expectedOpts]
    await verifyToken(jwt, TEST_TOKEN, TEST_PUBLIC_PEM, TEST_KEYS[0])
    await expect(jwt.verify).toHaveBeenCalledWith(...expected)
  })
})