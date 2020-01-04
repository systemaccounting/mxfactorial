const AWS = require('aws-sdk')
const { GraphQLClient } = require('graphql-request')
const { fetchRules } = require('./utils/queries/rules')

const {
  createAccount,
  deleteAccount,
  getToken,
} = require('./utils/integrationTestHelpers')

const {
  fakerAccountWithSevenRandomDigits,
  createRequestData,
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

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)

const taxExcluded = [ debitRequest[0] ]

let graphQLClient

beforeAll(async () => {
  jest.setTimeout(10000)
  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_CREDITOR,
    process.env.SECRET
  )
  let token = await getToken(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_CREDITOR,
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
    TEST_CREDITOR
  )
})

// todo: increase coverage
describe('tax rule returned by service', () => {
  test('adds 1 rule-generated object', async () => {
    let { rules } = await graphQLClient.request(fetchRules, {
      input: taxExcluded
    })
    expect(rules).toHaveLength(2)
  })

  test('0.540 tax price', async () => {
    let { rules } = await graphQLClient.request(fetchRules, {
      input: taxExcluded
    })
    let taxItem = rules.find(item => item.name === '9% state sales tax')
    expect(taxItem.price).toBe('0.540')
  })
})