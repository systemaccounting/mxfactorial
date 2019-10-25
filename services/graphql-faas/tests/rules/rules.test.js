const AWS = require('aws-sdk')
const { GraphQLClient } = require('graphql-request')
const { fetchRules } = require('../queries/rules')

const {
  itemsUnderTestArray,
  TEST_ACCOUNT
} = require('../utils/testData')

const {
  createAccount,
  deleteAccount,
  getToken
} = require('../utils/integrationTestHelpers')

const cognitoIdsp = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION
})

let graphQLClient

beforeAll(async () => {
  jest.setTimeout(10000)
  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_ACCOUNT,
    process.env.SECRET
  )
  let token = await getToken(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_ACCOUNT,
    process.env.SECRET
  )
  graphQLClient = new GraphQLClient(process.env.GRAPHQL_API, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token
    }
  })
})

afterAll(async () => {
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_ACCOUNT
  )
})

describe('graphql rules query', () => {
  it('returns rules-modified transaction items', async () => {
    const { rules } = await graphQLClient.request(fetchRules, {
      transactions: itemsUnderTestArray
    })
    const taxItem = rules.find(
      item => item.name === '9% state sales tax'
    )
    expect(rules).toHaveLength(2)
    expect(taxItem.price).toBe('0.540')
  })
})
