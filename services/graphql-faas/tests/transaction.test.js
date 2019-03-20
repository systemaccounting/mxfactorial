const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('./utils/tearDown')
const { REQUEST_URL } = require('./utils/baseUrl')
const { createTransaction } = require('./queries/transactions')

const graphQLClient = new GraphQLClient(REQUEST_URL, {
  headers: {
    'Content-Type': 'application/graphql',
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
    price: '24.750',
    quantity: '1',
    creditor: 'Mary'
  }
]

var transactionID
jest.setTimeout(30000) // lambda and serverless aurora cold starts

describe('Function As A Service GraphQL Server', () => {
  it('sends transaction mutation', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: testItems
    })
    const transaction = response.createTransaction[0]
    expect(transaction.creditor).toBe('Mary')
    done()
  })
})
