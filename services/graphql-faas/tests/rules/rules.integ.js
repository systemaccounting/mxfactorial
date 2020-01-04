const AWS = require('aws-sdk')
const { GraphQLClient } = require('graphql-request')
const {
  fetchRules,
  fetchRuleInstances
} = require('../queries/rules')

const {
  fakerAccountWithSevenRandomDigits,
  createRequestData
} = require('../utils/testData')

const {
  createAccount,
  deleteAccount,
  getToken
} = require('../utils/integrationTestHelpers')

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
  jest.setTimeout(30000)
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

afterAll(async () => {
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_CREDITOR
  )
})

describe('graphql rules', () => {
  it('rules query returns rules-modified transaction items', async () => {
    const { rules } = await graphQLClient.request(fetchRules, {
      items: taxExcluded
    })
    const taxItem = rules.find(
      item => item.name === '9% state sales tax'
    )
    expect(rules).toHaveLength(2)
    expect(taxItem.price).toBe('0.540')
  })

  it('rule instances query returns rules', async () => {
    const { ruleInstances } = await graphQLClient.request(fetchRuleInstances, {
      input: [ "name:" ]
    })
    expect(ruleInstances).toHaveLength(1)
  })
})
