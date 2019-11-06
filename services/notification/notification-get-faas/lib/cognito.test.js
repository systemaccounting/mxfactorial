const axios = require('axios')

const {
  getPools,
  filterCurrentCognitoPoolId,
  getCognitoJsonWebKeys,
  matchCognitoWebKey
} = require('./cognito')

const {
  TEST_POOL_LIST,
  TEST_UNMATCHABLE_POOL_LIST,
  TEST_DUPLICATE_POOL_LIST,
  TEST_KEYS
} = require('../tests/utils/testConstants')

const POOL_NAME = process.env.POOL_NAME

// comment .clearAllMocks() intended for .mockResolvedValueOnce:
// afterEach(() => {
//   jest.clearAllMocks()
// })

const mockAws = method => {
  return {
    [method]: jest.fn().mockImplementation(() => {
      return {
        promise: jest.fn().mockImplementation(() => {
          return {
            then: jest.fn().mockImplementation(() => {
              return {
                catch: jest.fn()
              }
            })
          }
        }).mockResolvedValueOnce({ UserPools: TEST_POOL_LIST })
      }
    })
  }
}

jest.mock('axios', () => {
  return {
    get: jest.fn().mockImplementation(() => {
      return {
        data: {
          keys: jest.requireActual('../tests/utils/testConstants').TEST_KEYS
        }
      }
    })
  }
})

afterAll(() => {
  jest.unmock('axios')
})

describe('cognito', () => {

  test('getPools', async () => {
    // only tests MaxResults: 25 case
    // MaxResults > 25 unlikely
    let cognito = mockAws('listUserPools')
    let expected = TEST_POOL_LIST
    let result = await getPools(cognito)
    await expect(result).toEqual(expected)
  })

  test('current cognito pool id from filterCurrentCognitoPoolId', () => {
    let expected = TEST_POOL_LIST[0].Id
    let result = filterCurrentCognitoPoolId(TEST_POOL_LIST, POOL_NAME)
    expect(result).toBe(expected)
  })

  test('filterCurrentCognitoPoolId throws 0 user pools matched error', () => {
    expect(() => filterCurrentCognitoPoolId(TEST_UNMATCHABLE_POOL_LIST, POOL_NAME))
      .toThrow('0 user pools matched')
  })

  test('filterCurrentCognitoPoolId throws duplicate pools matched error', () => {
    expect(() => filterCurrentCognitoPoolId(TEST_DUPLICATE_POOL_LIST, POOL_NAME))
      .toThrow('duplicate pools matched')
  })

  test('getCognitoJsonWebKeys retrieves keys', async () => {
    let expected = TEST_KEYS
    let result = await getCognitoJsonWebKeys(axios, 'testregion', 'testpoolid')
    await expect(result).toEqual(expected)
  })

  test('matchCognitoWebKey filters key with claimed key id', () => {
    let expected = TEST_KEYS[0]
    let CLAIMED_KEY_ID = TEST_KEYS[0].kid
    let result = matchCognitoWebKey(TEST_KEYS, CLAIMED_KEY_ID)
    expect(result).toEqual(expected)
  })

  test('matchCognitoWebKey throws 0 claimed cognito keys matched', () => {
    let CLAIMED_KEY_ID = '111'
    expect(() => matchCognitoWebKey(TEST_KEYS, CLAIMED_KEY_ID))
      .toThrow('0 claimed cognito keys matched')
  })
})