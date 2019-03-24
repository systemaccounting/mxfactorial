const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('./utils/tearDown')
const { REQUEST_URL } = require('./utils/baseUrl')
const { createTransaction } = require('./queries/transactions')

const graphQLClient = new GraphQLClient(REQUEST_URL, {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

afterAll(() => {
  tearDownIntegrationTestDataInRDS()
})

const testItems = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    creditor: 'Mary'
  },
  {
    name: '9% state sales tax',
    price: '0.540',
    quantity: '1',
    creditor: 'Mary'
  }
]

jest.setTimeout(30000) // lambda and serverless aurora cold starts

describe('Function As A Service GraphQL Server /transact endpoint', () => {
  it('sends transaction mutation', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: testItems
    })
    const transaction = response.createTransaction[1]
    expect(transaction.creditor).toBe('Mary')
    done()
  })

  it('returns empty array if there are no rules-required items', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: [testItems[0]]
    })
    expect(response.createTransaction).toHaveLength(0)
    done()
  })
})
