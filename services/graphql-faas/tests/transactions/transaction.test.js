const AWS = require('aws-sdk')
const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('../utils/tearDown')
const {
  createTransaction,
  fetchTransactions
} = require('../queries/transactions')

const {
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
  jest.setTimeout(15000) // lambda cold start
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
  tearDownIntegrationTestDataInRDS()
})

const debitRequest = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: TEST_ACCOUNT,
    debitor: TEST_ACCOUNT,
    creditor: 'Mary'
  },
  {
    name: '9% state sales tax',
    price: '0.540',
    quantity: '1',
    author: TEST_ACCOUNT,
    debitor: TEST_ACCOUNT,
    creditor: 'StateOfCalifornia'
  }
]

const creditRequest = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: TEST_ACCOUNT,
    creditor: TEST_ACCOUNT,
    debitor: 'Mary'
  },
  {
    name: '9% state sales tax',
    price: '0.540',
    quantity: '1',
    author: TEST_ACCOUNT,
    debitor: 'Mary',
    creditor: 'StateOfCalifornia'
  }
]

describe('graphql transact', () => {
  it('sends mutation', async () => {
    let response = await graphQLClient.request(createTransaction, {
      items: debitRequest
    })
    expect(response.createTransaction).toHaveLength(debitRequest.length)
  })

  it('sets debitor_approval_time if author === debitor', async () => {
    let response = await graphQLClient.request(createTransaction, {
      items: debitRequest
    })
    response.createTransaction.forEach(item => {
      if (item.author === item.debitor) {
        expect(item.creditor_approval_time).toBeNull()
        expect(item.debitor_approval_time).not.toBeNull()
      }
    })
  })

  it('sets creditor_approval_time if author === creditor', async () => {
    let response = await graphQLClient.request(createTransaction, {
      items: creditRequest
    })
    response.createTransaction.forEach(item => {
      if (item.author === item.creditor) {
        expect(item.creditor_approval_time).not.toBeNull()
        expect(item.debitor_approval_time).toBeNull()
      }
    })
  })
  // todo: test creditor != cognito account
  it('returns debit and credit requests matching authenticated account', async () => {
    let response = await graphQLClient.request(fetchTransactions, {
      user: TEST_ACCOUNT
    })
    response.transactions.forEach(item => {
      expect([item.debitor, item.creditor, item.author]).toContain(TEST_ACCOUNT)
    })
  })
})
