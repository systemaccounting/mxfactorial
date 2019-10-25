const AWS = require('aws-sdk')
const { GraphQLClient } = require('graphql-request')
const { fetchRules } = require('./utils/queries/rules')

const {
  createAccount,
  deleteAccount,
  getToken,
} = require('./utils/integrationTestHelpers')

const {
  itemsUnderTestArray,
  TEST_ACCOUNT
} = require('./utils/testData')

// env var inventory (avoid const assignment):
// process.env.AWS_REGION
// process.env.SECRET
// process.env.CLIENT_ID
// process.env.POOL_ID
// process.env.GRAPHQL_API

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

afterAll(async() => {
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_ACCOUNT
  )
})

// todo: increase coverage
describe('tax rule returned by service', () => {
  test('adds 1 rule-generated object', async () => {
    let { rules } = await graphQLClient.request(fetchRules, {
      transactions: itemsUnderTestArray
    })
    expect(rules).toHaveLength(2)
  })

  test('0.540 tax price', async () => {
    let { rules } = await graphQLClient.request(fetchRules, {
      transactions: itemsUnderTestArray
    })
    let taxItem = rules.find(item => item.name === '9% state sales tax')
    expect(taxItem.price).toBe('0.540')
  })
})