const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('../utils/tearDown')
const { REQUEST_URL } = require('../utils/baseUrl')
const { createTransaction } = require('../queries/transactions')

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
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary'
  },
  {
    name: '9% state sales tax',
    price: '0.540',
    quantity: '1',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'StateOfCalifornia'
  }
]

jest.setTimeout(30000) // lambda and serverless aurora cold starts

describe('Function As A Service GraphQL Server /transact endpoint', () => {
  it('sends transaction mutation', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: testItems
    })
    expect(response.createTransaction).toHaveLength(testItems.length)
    done()
  })

  it('sets debitor_approval_time and creditor_approval_time on create transaction', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: testItems
    })
    response.createTransaction.forEach(item => {
      expect(item.creditor_approval_time).not.toBeUndefined()
      expect(item.debitor_approval_time).not.toBeUndefined()
    })
    done()
  })
})
